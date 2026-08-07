// Turning "where" into a point.
//
// Four ways, cheapest and surest first:
//
//   1. bare coordinates the sender typed — needs nothing, never breaks
//   2. a coordinate carried in the link itself (some shared links have one)
//   3. the place id in the link → `map.naver.com/p/api/place/pagedesc/{id}`,
//      which answers with the place's own name and exact point
//   4. a NAME → the official Search (local) API, with real credentials
//
// **About (3), because it deserves saying plainly.** That route is the one the
// Naver map's own web app calls; it was found by reading the app's public
// bundle. It answers to this Worker under its true name — the user-agent below
// says yum.atfedi.de and links here — but only when a `Referer` naming the
// place's page comes with it. Without one it is 403, whatever the user-agent.
//
// So this is a door meant for Naver's own app, and we knock on it as ourselves
// rather than dressed as a browser. That distinction is the whole of it: the
// usual way people get this data is to generate a convincing Chrome user-agent
// and hide in the crowd. We would rather be refusable — if Naver doesn't want
// yum here, "yum.atfedi.de" is right there in the log to block. One request per
// DM that a person deliberately sent, and never a claim to be something else.
//
// It was nyanrus's call to use it, made knowing the above.
//
// What is NOT possible, checked hard: `m.place` / `pcmap.place` (including its
// GraphQL) refuse every honest user-agent with 429; the internal `allSearch` is
// behind a captcha; and Naver publishes no official place-id API at all.
//
// A link is worth sending either way — it stays on the pin as the way back.

// How this Worker names itself to Naver. Kept truthful on purpose — see the
// note at the top of the file.
const UA =
  'Mozilla/5.0 (compatible; yum.atfedi.de/0.1; +https://yum.atfedi.de/) a shared food map';

// A coordinate has to at least be a coordinate.
function plausible(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

// A bare "35.1601,129.0701" someone typed. Latitude first, the way people write
// it — but if the first number can't be a latitude, they meant it the other way.
export function parseBareCoords(text) {
  const m = String(text ?? '').match(/(-?\d{1,3}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})/);
  if (!m) return null;
  let [lat, lng] = [Number(m[1]), Number(m[2])];
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) [lat, lng] = [lng, lat];
  return plausible(lat, lng) ? { lat, lng } : null;
}

// A coordinate sitting in the link's own query string. Naver's `c=` is
// longitude first; the other forms vary, so take whichever pair shows up and
// let the range decide which number is which. No network — just the string.
export function coordsFromUrl(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  // ?c=129.0701,35.1601,15,0,0,0,dh  (lng,lat,zoom,…)
  const c = url.searchParams.get('c');
  if (c) {
    const parts = c.split(',').map(Number);
    if (parts.length >= 2) {
      const [a, b] = parts;
      const [lat, lng] = Math.abs(a) > 90 ? [b, a] : [a, b];
      if (plausible(lat, lng)) return { lat, lng };
    }
  }

  // ?lat=…&lng=… or ?y=…&x=… (Naver's x is longitude)
  for (const [latKey, lngKey] of [
    ['lat', 'lng'],
    ['lat', 'lon'],
    ['y', 'x'],
  ]) {
    const lat = Number(url.searchParams.get(latKey));
    const lng = Number(url.searchParams.get(lngKey));
    if (plausible(lat, lng)) return { lat, lng };
  }
  return null;
}

// Naver's Search (local) API covers Korea, so a point that lands outside East
// Asia means we read the numbers wrong rather than that the shop is in Peru.
// Used only to sanity-check this API's own answer — coordinates someone types
// by hand are not narrowed to any region.
function inRange(lat, lng) {
  return lat > 20 && lat < 50 && lng > 100 && lng < 150;
}

// The place id a Naver link names, if it names one.
export function placeIdFrom(href) {
  const m =
    String(href ?? '').match(
      /\/(?:entry\/)?(?:place|restaurant|cafe|hairshop|hospital|accommodation|attraction|beauty)\/(\d{6,})/,
    ) ||
    String(href ?? '').match(/[?&]placeId=(\d{6,})/) ||
    String(href ?? '').match(/\/(\d{9,})(?:[/?#]|$)/);
  return m ? m[1] : null;
}

// The place, by its id. `pagedesc` is the smallest of the six id routes the map
// app has (marker/type/pagedesc/destinationContent/panoramaPOI/flyingViewVideo)
// and the only one carrying both the name and the point.
//
// The Referer is required — without it this is 403 no matter who you say you
// are. It names the page this data belongs to, which is the page whose link
// someone put in a DM.
async function fromPlaceApi(id) {
  const res = await fetch(`https://map.naver.com/p/api/place/pagedesc/${id}`, {
    headers: {
      'user-agent': UA,
      accept: 'application/json',
      referer: `https://map.naver.com/p/entry/place/${id}`,
    },
  }).catch(() => null);
  if (!res?.ok) return null;

  const detail = (await res.json().catch(() => null))?.data?.placeDetail;
  const lat = Number(detail?.coordinate?.latitude);
  const lng = Number(detail?.coordinate?.longitude);
  if (!plausible(lat, lng)) return null;

  return { lat, lng, name: detail?.name ? String(detail.name).trim() : null };
}

// Places like to write a mark into the middle of their own name — 다:이룸,
// 카페·수요일 — and the search returns nothing at all for those, not even a
// near miss. So ask as it was written first, then with the mark taken out.
//
// Taken OUT, not turned into a space: 「다:이룸」 has to become 「다이룸」 to be
// found, and 「다 이룸」 finds nothing — the gap makes it two words instead of
// the name. The spaced form is still tried last, for names where the mark was
// standing in for a real separation.
const MARKS = /[:：·・|/\\~]+/g;

function queryForms(name) {
  const forms = [name];
  for (const form of [name.replace(MARKS, ''), name.replace(MARKS, ' ')]) {
    const cleaned = form.replace(/\s+/g, ' ').trim();
    if (cleaned && !forms.includes(cleaned)) forms.push(cleaned);
  }
  return forms;
}

// The official Search (local) API: a name becomes a point, an address, and the
// place's own spelling of itself — all in one call, so there is no separate
// geocoding step.
//
// `mapx`/`mapy` come back as WGS84 scaled by 10^7 (checked against a real
// answer: 1290452568/350922989 → 129.0452568, 35.0922989). `inRange` is the
// guard for the day that stops being true — a misread then becomes an honest
// "I couldn't tell" rather than a pin in the wrong hemisphere.
export async function searchByName(name, env) {
  const id = env?.NAVER_SEARCH_ID;
  const secret = env?.NAVER_SEARCH_SECRET;
  if (!id || !secret || !name) return null;

  for (const query of queryForms(name)) {
    const res = await fetch(
      'https://openapi.naver.com/v1/search/local.json?display=1&query=' +
        encodeURIComponent(query),
      { headers: { 'X-Naver-Client-Id': id, 'X-Naver-Client-Secret': secret } },
    ).catch(() => null);
    if (!res?.ok) continue;

    const item = (await res.json().catch(() => null))?.items?.[0];
    if (!item) continue;

    const lat = Number(item.mapy) / 1e7;
    const lng = Number(item.mapx) / 1e7;
    if (!plausible(lat, lng) || !inRange(lat, lng)) continue;

    return {
      lat,
      lng,
      // Naver wraps the matched words in <b>.
      name: String(item.title ?? query).replace(/<[^>]*>/g, '').trim() || query,
    };
  }
  return null;
}

// A Naver *shared folder* — someone's saved-places list, shared as a link
// rather than one place at a time. Same shape of question as pagedesc (an
// honest UA + a Referer naming the folder's own page, no cookies needed) but a
// different host and a different id: static analysis of the map app's bundle
// found the paths but not the host it calls; a real browser capture (a HAR
// nyanrus sent) is what actually showed pages.map.naver.com. Confirmed working
// anonymously — see kininaru.md's yum entry for how this was found.
export function folderIdFrom(href) {
  const m = String(href ?? '').match(/\/folder\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}

/**
 * Every bookmark in a shared folder, in one call — name, point, address, and
 * whatever memo the owner wrote, all at once (no need to look each place up
 * again through pagedesc). Returns null if the folder can't be read (not
 * shared, wrong id, Naver changed something).
 */
export async function fetchFolder(shareId) {
  const res = await fetch(
    `https://pages.map.naver.com/save-pages/api/maps-bookmark/v3/shares/${shareId}/bookmarks?start=0&limit=5000&sort=lastUseTime&createIdNo=false`,
    {
      headers: {
        'user-agent': UA,
        accept: 'application/json',
        referer: `https://pages.map.naver.com/save-pages/pc/detail-list/${shareId}`,
      },
    },
  ).catch(() => null);
  if (!res?.ok) return null;

  const data = await res.json().catch(() => null);
  if (!Array.isArray(data?.bookmarkList)) return null;

  const bookmarks = data.bookmarkList
    .map((b) => {
      const lat = Number(b.py);
      const lng = Number(b.px);
      if (!plausible(lat, lng)) return null;
      return {
        id: String(b.bookmarkId ?? ''),
        name: b.name ? String(b.name).trim() : null,
        lat,
        lng,
        address: b.address ?? null,
        note: b.memo ? String(b.memo).trim() : null,
        category: b.mcidName ?? null,
        url: b.sid ? `https://map.naver.com/p/entry/place/${b.sid}` : null,
      };
    })
    .filter(Boolean);

  return { name: data.folder?.name ?? null, bookmarks };
}

// The first link in a message that looks like a Naver place.
export function findPlaceLink(text) {
  const urls = String(text ?? '').match(/https?:\/\/[^\s<>"')]+/g) ?? [];
  return (
    urls.find((u) =>
      /(^|\/\/|\.)(naver\.me|map\.naver\.com|m\.place\.naver\.com|place\.naver\.com)/.test(u),
    ) ?? null
  );
}

/**
 * Where the DM meant, or null if it honestly can't be told.
 *
 * `link` may be null. `nameHints` are the places a name might be, best first —
 * what the sender wrote beside the link, and then the opening line of their
 * public post, which is where a name usually already is without anyone being
 * asked for it. `url` in the result is the link to keep on the pin, which
 * survives even when the point came from a name.
 */
export async function resolvePlace(link, nameHints, env) {
  const hints = (nameHints ?? []).map((h) => String(h ?? '').trim()).filter(Boolean);

  const fromUrl = link ? coordsFromUrl(link) : null;
  if (fromUrl) return { ...fromUrl, name: hints[0] || null, url: link };

  // By id, when the link carries one. A naver.me shortlink doesn't, so it has
  // to be followed first to find out which place it meant.
  let finalUrl = link;
  let id = link ? placeIdFrom(link) : null;
  if (link && !id) {
    const res = await fetch(link, {
      redirect: 'follow',
      headers: { 'user-agent': UA },
    }).catch(() => null);
    if (res) {
      finalUrl = res.url || link;
      id = placeIdFrom(finalUrl);
    }
  }
  if (id) {
    const place = await fromPlaceApi(id);
    if (place) return { ...place, url: finalUrl };
  }

  // By name — the official way in, and what carries a DM with no usable link.
  for (const hint of hints) {
    const searched = await searchByName(hint, env);
    if (searched) return { ...searched, url: finalUrl };
  }
  return null;
}
