// yum.atfedi.de/editor — a small back room for curating pins by hand: add,
// fix, remove, and pull in a whole Naver shared-folder link as candidates to
// pick from one at a time. Gated by the same sukhi login console uses
// ("今のところ sukhi アカウントで" — nyanrus, 2026-08-07); nothing here is
// reachable by the map's ordinary readers.
//
// A pin normally arrives as a public post + a DM reply (see federation.js) and
// is keyed by that post's own id. A pin made here has no such post, so it gets
// a synthetic one: 'editor:nyanrus:<uuid>'. Everything else about the row is
// the same yum_pins shape — the map at /places.json doesn't know or care which
// door a pin came in through.

import { yumAuth } from './auth.js';
import { folderIdFrom, fetchFolder } from './naver.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const toLogin = () => new Response(null, { status: 302, headers: { location: '/login' } });

const nowIso = () => new Date().toISOString();
const RATINGS = new Set(['suki', 'futsuu', 'imaichi']);

function plausible(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

async function listPins(env) {
  const { results } = await env.FEDI_DB.prepare(
    `SELECT post_iri AS id, name, lat, lng, rating, note, by_handle AS by,
            place_url, post_url, created_at, updated_at
       FROM yum_pins
      ORDER BY created_at DESC`,
  ).all();
  return results ?? [];
}

async function createPin(env, p) {
  const lat = Number(p.lat);
  const lng = Number(p.lng);
  if (!plausible(lat, lng)) throw new Error('lat/lng が変');
  const rating = RATINGS.has(p.rating) ? p.rating : 'suki';
  const id = `editor:nyanrus:${crypto.randomUUID()}`;
  const stamp = nowIso();
  await env.FEDI_DB.prepare(
    `INSERT INTO yum_pins
       (post_iri, post_url, dm_iri, by_handle, lat, lng, name, rating, note, place_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      p.place_url || null,
      id,
      p.by || null,
      lat,
      lng,
      p.name || null,
      rating,
      p.note || null,
      p.place_url || null,
      stamp,
      stamp,
    )
    .run();
  return id;
}

async function updatePin(env, id, p) {
  const lat = Number(p.lat);
  const lng = Number(p.lng);
  if (!plausible(lat, lng)) throw new Error('lat/lng が変');
  const rating = RATINGS.has(p.rating) ? p.rating : 'suki';
  await env.FEDI_DB.prepare(
    `UPDATE yum_pins SET
       name = ?, lat = ?, lng = ?, rating = ?, note = ?, by_handle = ?, place_url = ?, updated_at = ?
     WHERE post_iri = ?`,
  )
    .bind(p.name || null, lat, lng, rating, p.note || null, p.by || null, p.place_url || null, nowIso(), id)
    .run();
}

async function deletePin(env, id) {
  await env.FEDI_DB.prepare('DELETE FROM yum_pins WHERE post_iri = ?').bind(id).run();
}

/** Bulk-add straight from a Naver folder import — one row per picked bookmark. */
async function importBookmarks(env, bookmarks) {
  let inserted = 0;
  for (const b of bookmarks ?? []) {
    const lat = Number(b.lat);
    const lng = Number(b.lng);
    if (!plausible(lat, lng)) continue;
    const rating = RATINGS.has(b.rating) ? b.rating : 'suki';
    const id = `editor:nyanrus:${crypto.randomUUID()}`;
    const stamp = nowIso();
    await env.FEDI_DB.prepare(
      `INSERT INTO yum_pins
         (post_iri, post_url, dm_iri, by_handle, lat, lng, name, rating, note, place_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, b.url || null, id, b.by || null, lat, lng, b.name || null, rating, b.note || null, b.url || null, stamp, stamp)
      .run();
    inserted++;
  }
  return inserted;
}

export async function handleYumEditor(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // The door — the only paths that work without a session.
  if (path === '/login') return yumAuth.handleLogin(request, env);
  if (path === '/callback') return yumAuth.handleCallback(request, env);

  const publisher = await yumAuth.sessionPublisher(request, env);
  if (!publisher) {
    return path.startsWith('/api/') ? json({ error: 'unauthorized' }, 401) : toLogin();
  }

  if (path === '/logout') return yumAuth.handleLogout(request, env);

  if (path === '/api/pins') {
    if (request.method === 'GET') return json({ pins: await listPins(env) });
    if (request.method === 'POST') {
      const body = (await request.json().catch(() => null)) ?? {};
      try {
        const id = await createPin(env, body);
        return json({ ok: true, id });
      } catch (e) {
        return json({ error: e.message || '追加できなかった' }, 400);
      }
    }
    return json({ error: 'method not allowed' }, 405);
  }

  const pinMatch = path.match(/^\/api\/pins\/(.+)$/);
  if (pinMatch) {
    const id = decodeURIComponent(pinMatch[1]);
    if (request.method === 'PUT') {
      const body = (await request.json().catch(() => null)) ?? {};
      try {
        await updatePin(env, id, body);
        return json({ ok: true });
      } catch (e) {
        return json({ error: e.message || '直せなかった' }, 400);
      }
    }
    if (request.method === 'DELETE') {
      await deletePin(env, id);
      return json({ ok: true });
    }
    return json({ error: 'method not allowed' }, 405);
  }

  // POST /api/naver/folder — look at a folder link, hand back candidates.
  // Nothing is saved yet; the editor picks, then calls /api/naver/import.
  if (path === '/api/naver/folder' && request.method === 'POST') {
    const { url: folderUrl } = (await request.json().catch(() => null)) ?? {};
    const shareId = folderIdFrom(folderUrl);
    if (!shareId) return json({ error: 'フォルダのリンクに見えない' }, 400);
    const folder = await fetchFolder(shareId);
    if (!folder) return json({ error: '読めなかった(フォルダが非公開かも)' }, 502);
    return json(folder);
  }

  // POST /api/naver/import — the bookmarks the editor picked, as new pins.
  if (path === '/api/naver/import' && request.method === 'POST') {
    const { bookmarks } = (await request.json().catch(() => null)) ?? {};
    const inserted = await importBookmarks(env, bookmarks);
    return json({ ok: true, inserted });
  }

  if (path.startsWith('/api/')) return json({ error: 'not found' }, 404);

  // --- the page itself (static, built alongside yum's map) ---
  let assetPath = path === '/editor' ? '/editor/' : path;
  if (!assetPath.endsWith('/') && !/\.[^/]+$/.test(assetPath)) assetPath += '/';
  const res = await env.ASSETS.fetch(new Request(new URL(`/yum${assetPath}`, request.url), request));
  const headers = new Headers(res.headers);
  headers.set('cache-control', 'private, no-store');
  headers.set('x-robots-tag', 'noindex, nofollow');
  return new Response(res.body, { status: res.status, headers });
}
