// The blog's content, as the Worker sees it: the build-time AP manifest
// (writers + posts). Fetched from our own static assets — the .mdoc files
// aren't readable at runtime, but this JSON, built alongside them, is.

const MANIFEST = new URL('/blog/ap/manifest.json', 'https://blog.atfedi.de');

// Read once per isolate: the manifest is part of the deploy, so it can't
// change under a running Worker — and every blog page now asks for it (see
// blog/live.js), which is too often to parse a file that carries the rendered
// body of every post.
let cached;

async function manifest(env) {
  if (cached) return cached;
  try {
    const res = await env.ASSETS.fetch(new Request(MANIFEST));
    if (!res.ok) return { writers: [], posts: [] };
    return (cached = await res.json());
  } catch {
    return { writers: [], posts: [] };
  }
}

/** One writer by their actor identifier (the author id), or null. */
export async function getWriter(env, id) {
  return (await manifest(env)).writers.find((w) => w.id === id) ?? null;
}

/** A single post by language + slug, whoever wrote it (carries `.author`). */
export async function getPostAny(env, lang, slug) {
  return (await manifest(env)).posts.find((p) => p.lang === lang && p.slug === slug) ?? null;
}

/** Every translation of a post — one per language for an author + slug, sorted
 *  by language so the "primary" (first) is stable. */
export async function getTranslations(env, author, slug) {
  return (await manifest(env)).posts
    .filter((p) => p.author === author && p.slug === slug)
    .sort((a, b) => a.lang.localeCompare(b.lang));
}

/** Every post, any writer — the studio lists these to publish. */
export async function getAllPosts(env) {
  return (await manifest(env)).posts;
}
