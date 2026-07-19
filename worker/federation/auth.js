// Signing in to publish — sukhi's Mastodon-compatible OAuth2, the same flow any
// fediverse client uses. The app registers itself with sukhi once (no secret to
// set by hand); a successful login becomes a server-side session, and the
// console publishes with it.
//
// Publishing is authorized *separately* from authorship. A post keeps its own
// byline (shiro, …) and federates from that author's actor; but the act of
// pushing it to the fediverse — outward, hard to unsend — is held by an
// accountable person, not by the AI author. Only these handles may publish.
//
// The flow lives on console.atfedi.de, so the session cookie the callback sets
// exists on the console's host and nowhere else. The blog stays a purely public
// surface — no admin cookie rides along with a reader's request to it.

import { getAllPosts } from './content.js';
import { getFederation } from './index.js';
import { articleUri } from './article.js';
import {
  getOAuthApp,
  putOAuthApp,
  putSession,
  getSession,
  deleteSession,
  publishedObjectIds,
} from './store.js';

const REDIRECT_URI = 'https://console.atfedi.de/callback';
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
      client_name: 'atfedi.de console',
      redirect_uris: REDIRECT_URI,
      scopes: SCOPE,
      website: 'https://console.atfedi.de',
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

// GET /login — send the writer to sukhi to authorize.
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

// GET /callback — sukhi sends the writer back with a code.
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

  const headers = new Headers({ location: '/' });
  headers.append('set-cookie', clearCookie('ap_state'));
  headers.append('set-cookie', setCookie('ap_session', id, SESSION_TTL_S));
  return new Response(null, { status: 302, headers });
}

// GET /logout — end the session.
export async function handleLogout(request, env) {
  const id = parseCookies(request).ap_session;
  if (id) await deleteSession(env.FEDI_DB, id);
  const headers = new Headers({ location: '/login' });
  headers.append('set-cookie', clearCookie('ap_session'));
  return new Response(null, { status: 302, headers });
}

// GET /api/posts — every post, with whether it's already federated. The console
// draws the desk from this; the page is static, so all the state is here.
export async function handlePosts(request, env, publisher) {
  const posts = await getAllPosts(env);
  // Mark what's already out. "Published" is read from the outbox in D1 — the
  // persistent record — so the desk offers Update (never a second Create) for a
  // slug that's federated, and keeps doing so across redeploys. The article id
  // is derived from author + slug, so it's the same id publish.js recorded.
  const published = await publishedObjectIds(env.FEDI_DB);
  const fedCtx = getFederation(env).createContext(request, { env });
  for (const p of posts) {
    p.published = published.has(articleUri(fedCtx, p.author, p.slug).href);
  }
  return new Response(JSON.stringify({ publisher, posts }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

