// dash.atfedi.de — the front door to the back rooms.
//
// console (blog publishing + kiosk tagging) and yum's editor each already
// have their own sukhi login; neither was easy to just *find* from the
// public site. dash is the one memorable, login-gated address that links
// out to whichever of them you have reason to open — not a merge of them,
// just a doorway. Logging in here doesn't carry over to console or yum
// (each host's session cookie stays its own, same as it already did before
// dash existed).

import { dashAuth } from './auth.js';

const toLogin = () => new Response(null, { status: 302, headers: { location: '/login' } });

export async function handleDash(request, env, ctx) {
  const path = new URL(request.url).pathname;

  if (path === '/login') return dashAuth.handleLogin(request, env);
  if (path === '/callback') return dashAuth.handleCallback(request, env);

  const publisher = await dashAuth.sessionPublisher(request, env);
  if (!publisher) return toLogin();

  if (path === '/logout') return dashAuth.handleLogout(request, env);

  let assetPath = path;
  if (!assetPath.endsWith('/') && !/\.[^/]+$/.test(assetPath)) assetPath += '/';
  const res = await env.ASSETS.fetch(new Request(new URL(`/dash${assetPath}`, request.url), request));
  const headers = new Headers(res.headers);
  headers.set('cache-control', 'private, no-store');
  headers.set('x-robots-tag', 'noindex, nofollow');
  return new Response(res.body, { status: res.status, headers });
}
