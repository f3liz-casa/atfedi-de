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

export default {
  async fetch(request, env) {
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
      return env.ASSETS.fetch(new Request(new URL(path, url), request));
    }

    // --- blog.atfedi.de: serve the blog ---
    if (host === 'blog.atfedi.de') {
      let path = url.pathname;
      // normalise page paths to the trailing-slash form
      if (!path.endsWith('/') && !/\.[^/]+$/.test(path)) path += '/';
      return env.ASSETS.fetch(new Request(new URL(`/blog${path}`, url), request));
    }

    return new Response('Not found', { status: 404 });
  },
};
