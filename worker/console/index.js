// console.atfedi.de — the back room.
//
// Two desks in one house: publishing the blog's posts to the fediverse (what
// used to be blog.atfedi.de/ap/studio), and putting tags on kiosk's papers by
// hand. They share a door, so there's one place to sign in and one place that
// knows who's allowed.
//
// The gate is simple on purpose: everything here needs a publisher session
// except the two pages that make one (/login, /callback). Nothing on this host
// is public, so the check is at the top rather than repeated per route — a new
// endpoint added below is closed by default, which is the way round we want.

import {
  handleLogin,
  handleCallback,
  handleLogout,
  handlePosts,
  sessionPublisher,
} from '../federation/auth.js';
import { handlePublish } from '../federation/publish.js';
import { handlePapers, countUntagged } from '../kiosk/papers.js';
import { addTag, removeTag, listTags } from '../kiosk/tags.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const toLogin = () => new Response(null, { status: 302, headers: { location: '/login' } });

// POST/DELETE /api/tags — put a tag on a paper, or take one off. Free text: the
// vocabulary settles by use, so the only rule is what normalizeTag enforces.
async function handleTags(request, env, publisher) {
  if (request.method === 'GET') {
    // The count rides along with the tag list because the two change together:
    // the console re-reads this after every tag it puts on, which is exactly
    // when "how much is left" moves.
    return json({
      tags: await listTags(env.FEDI_DB),
      untagged: await countUntagged(env.FEDI_DB),
    });
  }
  const { iri, tag } = (await request.json().catch(() => ({}))) ?? {};
  if (!iri || !tag) return json({ error: 'iri and tag are required' }, 400);

  if (request.method === 'DELETE') {
    const removed = await removeTag(env.FEDI_DB, iri, tag);
    return removed ? json({ ok: true, tag: removed }) : json({ error: 'not a tag' }, 400);
  }
  if (request.method === 'POST') {
    const added = await addTag(env.FEDI_DB, iri, tag, publisher);
    // A tag that normalises to nothing (blank, or a pasted paragraph) is a
    // mistyping rather than an error worth a stack trace — say so plainly.
    return added ? json({ ok: true, tag: added }) : json({ error: 'not a tag' }, 400);
  }
  return json({ error: 'method not allowed' }, 405);
}

export async function handleConsole(request, env, ctx) {
  const path = new URL(request.url).pathname;

  // The door — the only paths that work without a session.
  if (path === '/login') return handleLogin(request, env);
  if (path === '/callback') return handleCallback(request, env);

  const publisher = await sessionPublisher(request, env);
  if (!publisher) {
    // A page gets sent to the door; a fetch gets told plainly, so the console's
    // own JS can say "your session ended" instead of parsing a redirect.
    return path.startsWith('/api/') ? json({ error: 'unauthorized' }, 401) : toLogin();
  }

  if (path === '/logout') return handleLogout(request, env);

  // --- the blog desk ---
  if (path === '/api/posts') return handlePosts(request, env, publisher);
  if (path === '/api/publish' && request.method === 'POST') {
    return handlePublish(request, env, ctx);
  }

  // --- the kiosk desk ---
  // The rack, read through the same endpoint the public rack uses — one shape
  // of paper, so the console sees exactly what a reader sees.
  if (path === '/api/papers') return handlePapers(request, env);
  if (path === '/api/tags') return handleTags(request, env, publisher);

  if (path.startsWith('/api/')) return json({ error: 'not found' }, 404);

  // --- the page itself (static, built from console/) ---
  let assetPath = path;
  if (!assetPath.endsWith('/') && !/\.[^/]+$/.test(assetPath)) assetPath += '/';
  const res = await env.ASSETS.fetch(
    new Request(new URL(`/console${assetPath}`, request.url), request),
  );
  // Nothing here should ever be cached by a shared cache or indexed — it's one
  // person's back room, and the pages are drawn from live data anyway.
  const headers = new Headers(res.headers);
  headers.set('cache-control', 'private, no-store');
  headers.set('x-robots-tag', 'noindex, nofollow');
  return new Response(res.body, { status: res.status, headers });
}
