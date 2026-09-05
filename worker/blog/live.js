// blog.atfedi.de — which posts are on the site.
//
// The build ships every post to the edge, drafts included: a deploy carries
// the files, it doesn't decide anything. What a reader can open is decided
// here, from one table in D1 (live_posts), which the console writes. So a
// draft can be committed, pushed and deployed and still be a draft, until
// someone chooses to publish it — and it can be taken back down without a
// build.
//
// A post that isn't live is hidden three ways: its page is a 404, the
// listings (home, author) drop its row, and the sitemap drops its line. The
// federation side asks the same question before it hands out an Article or
// sends one (federation/index.js, publish.js).

import { getAllPosts } from '../federation/content.js';
import { liveSlugs, putLive, deleteLive } from '../federation/store.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export async function isLive(env, slug) {
  return (await liveSlugs(env.FEDI_DB)).has(slug);
}

/** Slugs that are in the build but not on the site. */
async function hiddenSlugs(env) {
  const [posts, live] = await Promise.all([getAllPosts(env), liveSlugs(env.FEDI_DB)]);
  const hidden = new Set();
  for (const p of posts) if (!live.has(p.slug)) hidden.add(p.slug);
  return hidden;
}

// Pages whose body lists posts, and so get rewritten: the locale homes and
// the author pages. Each row there carries data-post="{slug}".
const LISTING = /^\/(?:en|ja|ko)\/(?:by\/[^/]+\/)?$/;
const POST = /^\/(?:en|ja|ko)\/([^/]+)\/$/;

/**
 * Serve a blog page, minus what isn't live. `serve(request)` fetches the
 * static asset; it's handed a request without conditional headers when the
 * page is going to be rewritten, since a 304 has no body to rewrite — and
 * the reply loses its validators for the same reason: the file on disk
 * didn't change, but what we show of it did.
 */
export async function serveBlogPage(env, path, request, serve) {
  const hidden = await hiddenSlugs(env);
  if (hidden.size === 0) return serve(request);

  const post = path.match(POST);
  if (post && hidden.has(post[1])) return new Response('Not found', { status: 404 });

  const isSitemap = path === '/sitemap.xml';
  if (!isSitemap && !LISTING.test(path)) return serve(request);

  const plain = new Request(request);
  plain.headers.delete('if-none-match');
  plain.headers.delete('if-modified-since');
  const res = await serve(plain);
  if (!res.ok) return res;

  const headers = new Headers(res.headers);
  headers.delete('etag');
  headers.delete('last-modified');
  headers.delete('content-length');

  if (isSitemap) {
    // One <url> per line; a post's line names its path.
    const lines = (await res.text()).split('\n').filter((line) => {
      const m = line.match(/<loc>https:\/\/blog\.atfedi\.de\/(?:en|ja|ko)\/([^/<]+)\/<\/loc>/);
      return !(m && hidden.has(m[1]));
    });
    return new Response(lines.join('\n'), { status: res.status, headers });
  }

  return new HTMLRewriter()
    .on('li[data-post]', {
      element(el) {
        if (hidden.has(el.getAttribute('data-post'))) el.remove();
      },
    })
    .transform(new Response(res.body, { status: res.status, headers }));
}

// POST /api/live { slug, live } — put a post on the site, or take it off.
// The console calls this; a publisher session is already checked by then.
export async function handleLive(request, env, publisher) {
  const { slug, live } = (await request.json().catch(() => ({}))) ?? {};
  if (!slug || typeof live !== 'boolean') return json({ error: 'slug and live are required' }, 400);
  if (!(await getAllPosts(env)).some((p) => p.slug === slug)) {
    return json({ error: 'no such post' }, 404);
  }
  if (live) await putLive(env.FEDI_DB, slug, publisher);
  else await deleteLive(env.FEDI_DB, slug);
  return json({ ok: true, slug, live });
}
