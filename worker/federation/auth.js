// Signing in to publish — sukhi's Mastodon-compatible OAuth2, the same flow any
// fediverse client uses. The app registers itself with sukhi once (no secret to
// set by hand); a successful login becomes a server-side session, and the
// studio page publishes with it.
//
// Publishing is authorized *separately* from authorship. A post keeps its own
// byline (shiro, …) and federates from that author's actor; but the act of
// pushing it to the fediverse — outward, hard to unsend — is held by an
// accountable person, not by the AI author. Only these handles may publish.

import { getAllPosts } from './content.js';
import {
  getOAuthApp,
  putOAuthApp,
  putSession,
  getSession,
  deleteSession,
} from './store.js';

const REDIRECT_URI = 'https://blog.atfedi.de/ap/callback';
const SCOPE = 'read';
const SESSION_TTL_S = 60 * 60 * 24 * 7; // a week
const STATE_TTL_S = 600;

const baseUrl = (env) => env.SUKHI_BASE_URL ?? 'https://sukhi.f3liz.casa';

// The only sukhi identities allowed to publish (lowercased for comparison).
const PUBLISHERS = ['@kuro_admin@sukhi.f3liz.casa'];

/** Whether a handle may publish. */
export function isPublisher(handle) {
  return handle != null && PUBLISHERS.includes(handle.toLowerCase());
}

// --- cookies ---------------------------------------------------------------

function parseCookies(request) {
  const out = {};
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
const setCookie = (name, value, maxAge) =>
  `${name}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
const clearCookie = (name) => `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

// --- the sukhi app + identity ----------------------------------------------

// Our registered OAuth app for this sukhi, registering it on first need.
async function getApp(env) {
  const base = baseUrl(env);
  const existing = await getOAuthApp(env.FEDI_DB, base);
  if (existing) return { base, ...existing };

  const res = await fetch(new URL('/api/v1/apps', base), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_name: 'atfedi.de blog',
      redirect_uris: REDIRECT_URI,
      scopes: SCOPE,
      website: 'https://blog.atfedi.de',
    }),
  });
  if (!res.ok) throw new Error('app registration failed');
  const app = await res.json();
  await putOAuthApp(env.FEDI_DB, base, app.client_id, app.client_secret);
  return { base, client_id: app.client_id, client_secret: app.client_secret };
}

// A sukhi access token → the @handle it belongs to (lowercased), or null.
export async function handleForToken(base, token) {
  let acct;
  try {
    const res = await fetch(new URL('/api/v1/accounts/verify_credentials', base), {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    acct = await res.json();
  } catch {
    return null;
  }
  if (!acct?.username) return null;
  return `@${acct.username}@${new URL(base).host}`.toLowerCase();
}

// A session cookie → the publisher handle, or null (expired sessions are swept).
export async function sessionPublisher(request, env) {
  const id = parseCookies(request).ap_session;
  if (!id) return null;
  const s = await getSession(env.FEDI_DB, id);
  if (!s) return null;
  if (new Date(s.expires).getTime() < Date.now()) {
    await deleteSession(env.FEDI_DB, id);
    return null;
  }
  return isPublisher(s.writer) ? s.writer : null;
}

// --- the endpoints ---------------------------------------------------------

// GET /ap/login — send the writer to sukhi to authorize.
export async function handleLogin(request, env) {
  let app;
  try {
    app = await getApp(env);
  } catch {
    return new Response('sukhi login is unavailable right now', { status: 502 });
  }
  const state = crypto.randomUUID();
  const authorize = new URL('/oauth/authorize', app.base);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('client_id', app.client_id);
  authorize.searchParams.set('redirect_uri', REDIRECT_URI);
  authorize.searchParams.set('scope', SCOPE);
  authorize.searchParams.set('state', state);

  const headers = new Headers({ location: authorize.href });
  headers.append('set-cookie', setCookie('ap_state', state, STATE_TTL_S));
  return new Response(null, { status: 302, headers });
}

// GET /ap/callback — sukhi sends the writer back with a code.
export async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(request);
  if (!code || !state || state !== cookies.ap_state) {
    return new Response('login state did not match — please try again', { status: 400 });
  }

  const app = await getApp(env);
  let token;
  try {
    const res = await fetch(new URL('/oauth/token', app.base), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: app.client_id,
        client_secret: app.client_secret,
        redirect_uri: REDIRECT_URI,
        scope: SCOPE,
      }),
    });
    if (!res.ok) throw new Error('token');
    token = (await res.json()).access_token;
  } catch {
    return new Response('could not complete login', { status: 502 });
  }
  if (!token) return new Response('no access token', { status: 502 });

  const handle = await handleForToken(app.base, token);
  if (!isPublisher(handle)) {
    const headers = new Headers({ 'content-type': 'text/plain; charset=utf-8' });
    headers.append('set-cookie', clearCookie('ap_state'));
    return new Response("You're signed in, but this account isn't authorized to publish here.", {
      status: 403,
      headers,
    });
  }

  const id = (crypto.randomUUID() + crypto.randomUUID()).replaceAll('-', '');
  const expires = new Date(Date.now() + SESSION_TTL_S * 1000).toISOString();
  await putSession(env.FEDI_DB, { id, writer: handle, token, expires });

  const headers = new Headers({ location: '/ap/studio' });
  headers.append('set-cookie', clearCookie('ap_state'));
  headers.append('set-cookie', setCookie('ap_session', id, SESSION_TTL_S));
  return new Response(null, { status: 302, headers });
}

// GET /ap/logout — end the session.
export async function handleLogout(request, env) {
  const id = parseCookies(request).ap_session;
  if (id) await deleteSession(env.FEDI_DB, id);
  const headers = new Headers({ location: '/ap/login' });
  headers.append('set-cookie', clearCookie('ap_session'));
  return new Response(null, { status: 302, headers });
}

// GET /ap/studio — the publishing desk. Shows every post (any author); pressing
// Publish federates it from its own author's actor.
export async function handleStudio(request, env) {
  const publisher = await sessionPublisher(request, env);
  if (!publisher) {
    return new Response(null, { status: 302, headers: { location: '/ap/login' } });
  }
  const posts = await getAllPosts(env);
  return new Response(studioHtml(publisher, posts), {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

// --- the studio page -------------------------------------------------------

const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function studioHtml(publisher, posts) {
  // One row per slug — its languages federate together as one Article — so group
  // the per-language posts and list the languages.
  const bySlug = new Map();
  for (const p of posts) {
    const key = `${p.author}/${p.slug}`;
    if (!bySlug.has(key)) bySlug.set(key, { ...p, langs: [] });
    bySlug.get(key).langs.push(p.lang);
  }
  const rows = [...bySlug.values()]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map(
      (p) => `
      <li class="post">
        <div>
          <span class="lang">${esc(p.langs.slice().sort().join(' '))}</span>
          <span class="title">${esc(p.title)}</span>
          <time>${esc(p.author)} · ${esc(String(p.date).slice(0, 10))}</time>
        </div>
        <span class="acts">
          <button data-lang="${esc(p.lang)}" data-slug="${esc(p.slug)}">Publish</button>
          <button data-lang="${esc(p.lang)}" data-slug="${esc(p.slug)}" data-action="update">Update</button>
        </span>
      </li>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Studio — atfedi.de blog</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 16px/1.6 system-ui, sans-serif; max-width: 44rem; margin: 2rem auto; padding: 0 1rem; }
  header { display: flex; justify-content: space-between; align-items: baseline; }
  h1 { font-size: 1.3rem; }
  .who { opacity: 0.7; font-size: 0.9rem; }
  ul { list-style: none; padding: 0; }
  .post { display: flex; justify-content: space-between; align-items: center; gap: 1rem;
          padding: 0.7rem 0; border-top: 1px solid color-mix(in srgb, currentColor 15%, transparent); }
  .lang { font-size: 0.75rem; text-transform: uppercase; opacity: 0.6; margin-right: 0.5rem; }
  .title { font-weight: 600; }
  time { display: block; font-size: 0.8rem; opacity: 0.55; }
  button { font: inherit; padding: 0.35rem 0.9rem; cursor: pointer; }
  button[disabled] { opacity: 0.5; cursor: default; }
  .msg { font-size: 0.85rem; margin-left: 0.5rem; }
  .ok { color: #2a7; } .err { color: #c33; }
  footer { margin-top: 2rem; font-size: 0.85rem; opacity: 0.7; }
</style>
</head>
<body>
  <header>
    <h1>Studio</h1>
    <span class="who">${esc(publisher)} · <a href="/ap/logout">sign out</a></span>
  </header>
  <p>Publishing sends each post to its author's followers on the fediverse, under the author's name.</p>
  <ul>${rows || '<li>No posts yet.</li>'}</ul>
  <footer>authorized as ${esc(publisher)}</footer>
<script>
  for (const button of document.querySelectorAll('button[data-slug]')) {
    button.addEventListener('click', async () => {
      const { lang, slug, action } = button.dataset;
      button.disabled = true;
      const msg = document.createElement('span');
      msg.className = 'msg';
      msg.textContent = action === 'update' ? 'updating…' : 'publishing…';
      button.after(msg);
      try {
        const res = await fetch('/ap/publish', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ lang, slug, action }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          msg.textContent = action === 'update' ? 'updated' : 'published';
          msg.className = 'msg ok';
        } else {
          msg.textContent = data.error || 'failed';
          msg.className = 'msg err';
          button.disabled = false;
        }
      } catch {
        msg.textContent = 'failed';
        msg.className = 'msg err';
        button.disabled = false;
      }
    });
  }
</script>
</body>
</html>`;
}
