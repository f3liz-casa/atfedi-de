// Comments on an Article read at the newsstand — the replies from across the
// fediverse. kiosk fetches the object's `replies` collection (fedify follows and
// pages it, with the SSRF-guarded loader) and hands back each reply sanitized,
// so the reader can show the conversation under a paper it doesn't own.

import { Note, Article } from '@fedify/fedify/vocab';
import { getFederation } from '../federation/index.js';
import { sanitizeComment } from '../federation/sanitize.js';

const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

const hrefOf = (v) => (v?.href != null ? String(v.href) : null);

// GET /ap/comments?url=<article iri>
export async function handleComments(request, env, ctx) {
  const raw = new URL(request.url).searchParams.get('url');
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

  const fedCtx = getFederation(env).createContext(request, { env, ctx });
  let obj;
  try {
    obj = await fedCtx.lookupObject(target.href);
  } catch {
    return json({ error: 'could not fetch that object' }, 502);
  }
  if (obj == null) return json({ error: 'not found' }, 404);

  const replies = await obj.getReplies(fedCtx).catch(() => null);
  if (replies == null) return json({ comments: [] }, 200, { 'cache-control': 'public, max-age=120' });

  const comments = [];
  try {
    for await (const item of fedCtx.traverseCollection(replies)) {
      if (!(item instanceof Note) && !(item instanceof Article)) continue;
      comments.push(await shapeComment(item, fedCtx));
      if (comments.length >= 100) break; // a reasonable ceiling
    }
  } catch {
    /* a partial thread is better than none */
  }

  // Oldest first reads like a conversation.
  comments.sort((a, b) => (a.published ?? '').localeCompare(b.published ?? ''));
  return json({ comments }, 200, { 'cache-control': 'public, max-age=120' });
}

async function shapeComment(note, ctx) {
  let author = null;
  try {
    const a = await note.getAttribution(ctx);
    if (a?.id != null) {
      const username = a.preferredUsername ? String(a.preferredUsername) : null;
      author = {
        name: a.name?.toString() ?? null,
        handle: username ? `@${username}@${new URL(a.id.href).host}` : null,
        url: hrefOf(a.url) ?? a.id.href,
        icon: hrefOf(a.icon?.url) ?? null,
      };
    }
  } catch {
    /* author is a nicety */
  }
  const content = typeof note.content === 'string' ? note.content : (note.content?.toString() ?? '');
  return {
    id: note.id?.href ?? null,
    html: sanitizeComment(content),
    published: note.published?.toString() ?? null,
    url: hrefOf(note.url) ?? note.id?.href ?? null,
    author,
  };
}
