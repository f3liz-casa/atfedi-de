// Looking up the fediverse instance a reader calls home — so kiosk can show its
// icon and name, and send the reader there to reply (kiosk itself only reads).
//
// Software-agnostic: nodeinfo for the software name, and the instance's own home
// page (Open Graph / icon links) for a human name and icon. Everything is best
// effort — a missing piece just isn't shown.

const UA = 'kiosk.atfedi.de (+https://kiosk.atfedi.de; a fediverse reader)';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400' },
  });

// First capture group of the first matching pattern, else null.
function firstMatch(html, patterns) {
  for (const re of patterns) {
    const m = re.exec(html);
    if (m && m[1]) return m[1];
  }
  return null;
}

const attr = (prop, val) =>
  new RegExp(`<(?:meta|link)[^>]*${prop}=["']${val}["'][^>]*>`, 'i');

// Pull content="…" / href="…" out of a matched tag.
function tagValue(html, prop, val) {
  const tag = attr(prop, val).exec(html)?.[0];
  if (!tag) return null;
  return firstMatch(tag, [/content=["']([^"']+)["']/i, /href=["']([^"']+)["']/i]);
}

// GET /ap/instance?url=<instance origin or hostname>
export async function handleInstance(request, env) {
  const raw = new URL(request.url).searchParams.get('url');
  if (!raw) return json({ error: 'url is required' }, 400);

  let origin;
  try {
    const u = new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`);
    if (u.protocol !== 'https:') return json({ error: 'https only' }, 400);
    if (!u.hostname.includes('.') || u.hostname === 'localhost') return json({ error: 'not a public host' }, 400);
    origin = u.origin;
  } catch {
    return json({ error: 'not a url' }, 400);
  }

  const opts = { headers: { 'user-agent': UA }, cf: { cacheTtl: 86400 } };

  // Software name from nodeinfo (best effort).
  let software = null;
  try {
    const disc = await fetch(new URL('/.well-known/nodeinfo', origin), opts).then((r) => r.json());
    const href = disc?.links?.find((l) => String(l.rel).includes('nodeinfo'))?.href;
    if (href) {
      const ni = await fetch(href, opts).then((r) => r.json());
      software = ni?.software?.name ?? null;
    }
  } catch {
    /* no nodeinfo — fine */
  }

  // The remote-interaction template, discovered the standard way: the instance
  // actor's WebFinger advertises a `…/subscribe` link whose {uri} you fill with
  // the thing you want to act on. (Mastodon-family instances have it; some, like
  // Misskey, don't — then the reply link falls back to the instance's search.)
  let subscribe = null;
  try {
    const host = new URL(origin).host;
    const wf = await fetch(
      new URL(`/.well-known/webfinger?resource=acct:${host}@${host}`, origin),
      { headers: { 'user-agent': UA, accept: 'application/jrd+json' }, cf: { cacheTtl: 86400 } },
    ).then((r) => r.json());
    const link = wf?.links?.find((l) => String(l.rel).includes('ostatus.org/schema/1.0/subscribe'));
    if (link?.template) subscribe = link.template;
  } catch {
    /* no template — the reader falls back to search */
  }

  // Human name and icon from the home page.
  let name = null;
  let icon = null;
  try {
    const html = (await fetch(origin, opts).then((r) => r.text())).slice(0, 60000);
    name =
      tagValue(html, 'property', 'og:site_name') ||
      firstMatch(html, [/<title[^>]*>([^<]+)<\/title>/i]);
    // Prefer a real site icon; og:image is a share banner (e.g. Misskey's
    // instance background), not an icon, so it's only a last resort.
    icon =
      tagValue(html, 'rel', 'apple-touch-icon') ||
      tagValue(html, 'rel', 'icon') ||
      tagValue(html, 'property', 'og:image') ||
      '/favicon.ico';
    icon = new URL(icon, origin).href; // resolve relative
  } catch {
    /* no home page — fall back to the host name */
  }

  return json({
    url: origin,
    host: new URL(origin).host,
    name: name?.trim() || new URL(origin).host,
    icon,
    software,
    subscribe,
  });
}
