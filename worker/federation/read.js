// Reading an Article from elsewhere. fedify's lookupObject fetches and parses
// the remote object (with the document loader's SSRF guards); we pull out the
// bits a reader needs and sanitize the body. The static /{lang}/read page
// fetches this and renders it in the blog's own skin.

import { Article, Note } from '@fedify/fedify/vocab';
import { getFederation } from './index.js';
import { sanitizeArticle } from './sanitize.js';

const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

// A URL or Link, as a plain href string.
const hrefOf = (v) => (v?.href != null ? String(v.href) : null);

// Fetch a remote AP object (with the document loader's SSRF guards) and shape it
// for the reader, from an already-parsed https/http target. Returns { data } on
// success or { error, status } — shared by the JSON endpoint (/ap/read, the
// client fetch) and the server-rendered reader page (kiosk/render.js).
export async function shapeFromTarget(request, env, ctx, target, lang = null) {
  const fedCtx = getFederation(env).createContext(request, { env, ctx });
  let obj;
  try {
    obj = await fedCtx.lookupObject(target.href);
  } catch {
    return { error: 'could not fetch that object', status: 502 };
  }
  if (obj == null || !(obj instanceof Article || obj instanceof Note)) {
    return { error: 'not an article or note', status: 404 };
  }
  // The reader passes its own language; if the Article carries versions in a
  // contentMap, we hand back the one that fits.
  return { data: await shapeReadResult(obj, fedCtx, target.href, lang) };
}

// GET /ap/read?url=<remote AP object>
export async function handleRead(request, env, ctx) {
  const url = new URL(request.url);
  const raw = url.searchParams.get('url');
  if (!raw) return json({ error: 'url is required' }, 400);

  let target;
  try {
    target = new URL(raw);
  } catch {
    return json({ error: 'not a url' }, 400);
  }
  if (target.protocol !== 'https:' && target.protocol !== 'http:') {
    return json({ error: 'unsupported scheme' }, 400);
  }

  const result = await shapeFromTarget(request, env, ctx, target, url.searchParams.get('lang'));
  if (result.error) return json({ error: result.error }, result.status);
  return json(result.data, 200, { 'cache-control': 'public, max-age=300' });
}

// From a language map ({ "ja": …, "ko-KR": … }), the value that best fits the
// reader's language: an exact tag, else a same-language region ("ja" ← "ja-JP"),
// else the first language the article actually has (a real version — the
// unlocalized default can be a translations preamble), else the given fallback.
function pickLocalized(map, lang, fallback) {
  if (map == null || typeof map !== 'object') return fallback;
  const keys = Object.keys(map);
  if (keys.length === 0) return fallback;
  if (lang) {
    if (typeof map[lang] === 'string') return map[lang];
    const key = keys.find((k) => k.toLowerCase().split('-')[0] === lang.toLowerCase());
    if (key) return map[key];
  }
  return typeof map[keys[0]] === 'string' ? map[keys[0]] : fallback;
}

// The distinct primary language subtags an article carries, in order — ["en",
// "ja", "ko"] from a map keyed by "en" / "ja" / "ko-KR".
function langsFromMap(map) {
  if (map == null || typeof map !== 'object') return [];
  const out = [];
  for (const k of Object.keys(map)) {
    const base = k.toLowerCase().split('-')[0];
    if (base && !out.includes(base)) out.push(base);
  }
  return out;
}

// A language map re-keyed by primary subtag ({ "ko-KR": … } → { "ko": … }),
// first value per language winning.
function byPrimarySubtag(map) {
  const out = {};
  if (map == null || typeof map !== 'object') return out;
  for (const [k, v] of Object.entries(map)) {
    const base = k.toLowerCase().split('-')[0];
    if (base && typeof v === 'string' && !(base in out)) out[base] = v;
  }
  return out;
}

// The title, per-language titles, and available languages of a fetched Article
// — for the rack, which shows each paper's title in the reader's language (when
// it has one) and lists the languages beside it. Used by the gatherers.
export async function articleMeta(article) {
  let title = article.name?.toString() ?? null;
  let langs = [];
  let titleMap = {};
  try {
    const raw = await article.toJsonLd({ format: 'compact' });
    langs = langsFromMap(raw?.nameMap ?? raw?.contentMap);
    titleMap = byPrimarySubtag(raw?.nameMap);
    title = pickLocalized(raw?.nameMap, null, title);
  } catch {
    /* no maps — the default name stands */
  }
  return { title, langs, titleMap };
}

// Pull a fetched Article/Note into the shape the reader page renders. The body
// is sanitized here — it's remote HTML. When `lang` is given and the Article has
// a nameMap/contentMap, the matching-language title and body are chosen.
export async function shapeReadResult(obj, ctx, fallbackUrl, lang = null) {
  let author = null;
  try {
    const a = await obj.getAttribution(ctx);
    if (a?.id != null) {
      const username = a.preferredUsername ? String(a.preferredUsername) : null;
      author = {
        uri: a.id.href,
        name: a.name?.toString() ?? null,
        handle: username ? `@${username}@${new URL(a.id.href).host}` : null,
        url: hrefOf(a.url) ?? a.id.href,
      };
    }
  } catch {
    /* author is a nicety — a missing one shouldn't sink the read */
  }

  // Defaults — the object's unlocalized title/body.
  let title = obj.name?.toString() ?? null;
  let content = typeof obj.content === 'string' ? obj.content : (obj.content?.toString() ?? '');
  let langs = [];

  // The language maps live in the JSON-LD (nameMap / contentMap); fedify's own
  // getters only surface one value, so read them from there. We show the version
  // that fits the reader's language, falling back to a real language the article
  // has (not the unlocalized default, which may be a translations preamble), and
  // report every language it's available in.
  try {
    const raw = await obj.toJsonLd({ format: 'compact' });
    langs = langsFromMap(raw?.nameMap ?? raw?.contentMap);
    title = pickLocalized(raw?.nameMap, lang, title);
    content = pickLocalized(raw?.contentMap, lang, content);
  } catch {
    /* no maps, or serialization declined — the defaults stand */
  }

  return {
    kind: obj instanceof Article ? 'Article' : 'Note',
    id: obj.id?.href ?? fallbackUrl,
    title,
    html: sanitizeArticle(content),
    published: obj.published?.toString() ?? null,
    url: hrefOf(obj.url) ?? obj.id?.href ?? fallbackUrl,
    author,
    langs,
  };
}
