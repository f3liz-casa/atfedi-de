// atfedi.de — the dispatcher Worker.
//
// Routes every request by hostname:
//   {locale}.atfedi.de  → the catalog's {locale} subtree (static assets)
//   blog.atfedi.de      → the blog (static assets)
//   atfedi.de           → detect the browser language and redirect to a
//                         subdomain; old /{lang}/* path URLs 301 to it
//
// The built catalog lives in the assets under /catalog/{locale}/... ; the
// shared build assets (/_astro/, favicon) sit at /catalog/ with no locale.
//
// The blog is all static assets, but /v/preview/* is rendered on demand —
// that route is its own one-route SSR project (../preview). Its Astro
// build emits a Worker (../dist/preview/server/entry.mjs) which is bundled
// in here at deploy time and handed every /v/preview/* request. The
// preview's client assets (CSS, fonts) are merged into the blog's /_astro/
// at build time, so the served preview page finds them like any blog page.

import previewSSR from '../dist/preview/server/entry.mjs';

const LOCALES = ['en', 'ja', 'ko'];
const DEFAULT_LOCALE = 'en';

// Best supported locale from an Accept-Language header, else the default.
function pickLocale(header) {
  if (header) {
    for (const part of header.split(',')) {
      const code = part.split(';')[0].trim().slice(0, 2).toLowerCase();
      if (LOCALES.includes(code)) return code;
    }
  }
  return DEFAULT_LOCALE;
}

// Serve a static asset. Hashed build assets (/_astro/) never change under
// the same name, so those get a long immutable cache; everything else keeps
// the platform default (revalidate every time).
async function serveAsset(env, url, path, request) {
  const res = await env.ASSETS.fetch(new Request(new URL(path, url), request));
  // /_astro/ は Astro、/_app/immutable/ は SvelteKit(museum)のハッシュ付き資産
  const immutable =
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/_app/immutable/');
  if (res.ok && immutable) {
    const headers = new Headers(res.headers);
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    return new Response(res.body, { status: res.status, headers });
  }
  return res;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname;
    const sub = host.split('.')[0];

    // --- apex: atfedi.de ---
    if (host === 'atfedi.de') {
      // old path-based URLs (atfedi.de/ja/...) → 301 to the subdomain
      const old = url.pathname.match(/^\/(en|ja|ko)(\/.*)?$/);
      if (old) {
        return Response.redirect(
          `https://${old[1]}.atfedi.de${old[2] || '/'}${url.search}`,
          301,
        );
      }
      // otherwise → detect the browser language and send there
      const locale = pickLocale(request.headers.get('accept-language'));
      return Response.redirect(
        `https://${locale}.atfedi.de${url.pathname}${url.search}`,
        302,
      );
    }

    // --- {locale}.atfedi.de: serve the catalog ---
    if (LOCALES.includes(sub)) {
      let path = url.pathname;
      const isSharedAsset =
        path.startsWith('/_astro/') || path === '/favicon.svg';

      if (isSharedAsset) {
        path = `/catalog${path}`;
      } else {
        // a page — normalise to the trailing-slash form, then prefix the locale
        if (!path.endsWith('/') && !/\.[^/]+$/.test(path)) path += '/';
        path = `/catalog/${sub}${path}`;
      }
      return serveAsset(env, url, path, request);
    }

    // --- danro.atfedi.de: a one-page intro for the danro-talk widget ---
    if (host === 'danro.atfedi.de') {
      let path = url.pathname;
      if (!path.endsWith('/') && !/\.[^/]+$/.test(path)) path += '/';
      return serveAsset(env, url, `/danro${path}`, request);
    }

    // --- museum.atfedi.de: 博物街(SvelteKit static、パス先頭が言語) ---
    if (host === 'museum.atfedi.de') {
      let path = url.pathname;
      const isRootFile =
        path === '/sitemap.xml' || path === '/robots.txt' ||
        path === '/favicon.svg' || path.startsWith('/_app/');
      // 言語なしで来たら、ブラウザの言語の入り口へ(古い /section/... も拾う)
      if (!isRootFile && !/^\/(en|ja|ko)(\/|$)/.test(path)) {
        const locale = pickLocale(request.headers.get('accept-language'));
        return Response.redirect(
          `https://museum.atfedi.de/${locale}${path === '/' ? '/' : path}${url.search}`,
          302,
        );
      }
      if (!path.endsWith('/') && !/\.[^/]+$/.test(path)) path += '/';
      return serveAsset(env, url, `/museum${path}`, request);
    }

    // --- blog.atfedi.de: serve the blog (path-based locales) ---
    if (host === 'blog.atfedi.de') {
      let path = url.pathname;
      // /v/ is the live preview, and nothing else — the preview is an
      // SSR route, so hand it to the preview project's Astro worker
      if (path.startsWith('/v/preview/')) {
        return previewSSR.fetch(request, env, ctx);
      }
      if (path.startsWith('/v/')) {
        return new Response(
          'preview only — use /v/preview/{ref}/-/{lang}/{slug}',
          { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } },
        );
      }
      // shared build assets and root-level crawler files pass straight through
      if (
        path.startsWith('/_astro/') ||
        path === '/favicon.svg' ||
        path === '/robots.txt' ||
        path === '/sitemap.xml'
      ) {
        return serveAsset(env, url, `/blog${path}`, request);
      }
      // pages live under a locale; anything else → detect language, redirect
      if (!/^\/(en|ja|ko)(\/|$)/.test(path)) {
        const locale = pickLocale(request.headers.get('accept-language'));
        return Response.redirect(`https://blog.atfedi.de/${locale}/`, 302);
      }
      if (!path.endsWith('/') && !/\.[^/]+$/.test(path)) path += '/';
      return serveAsset(env, url, `/blog${path}`, request);
    }

    return new Response('Not found', { status: 404 });
  },
};
