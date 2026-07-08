import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { locales } from '../../locales';

// Absolute-ise the relative links/images the site renders, so the content
// reads correctly once it's federated away from blog.atfedi.de.
const site = 'https://blog.atfedi.de';
const absolutise = (html: string) =>
  html
    .replace(/(<a\b[^>]*\bhref=")\/(?!\/)/g, `$1${site}/`)
    .replace(/(<img\b[^>]*\bsrc=")\/(?!\/)/g, `$1${site}/`);

// The AP manifest — the blog as the federation Worker sees it. The Worker
// can't read .mdoc at runtime, so this one JSON (built with the site) carries
// the writers and posts it needs to speak ActivityPub. Frontmatter only; the
// canonical reading experience stays the web page.
export const GET: APIRoute = async () => {
  const authors = await getCollection('authors');
  const posts = await getCollection('posts');

  // authors/{lang}/{id}.mdoc — the id is the filename, the handle is the same
  // across languages, so one writer per id.
  const writers = new Map<string, unknown>();
  for (const a of authors) {
    const id = a.id.slice(a.id.indexOf('/') + 1);
    if (writers.has(id)) continue;
    writers.set(id, {
      id,
      name: a.data.name ?? id,
      handle: a.data.handle, // their fedi handle, e.g. @name@sukhi.f3liz.casa
      ai: a.data.ai ?? false,
    });
  }

  // posts/{lang}/{slug}.mdoc — federate only the multilingual posts (skip the
  // English-only dev posts under posts/v/). Render each body to HTML now, at
  // build time, so the Worker can federate the full Article, not just the lede.
  const container = await AstroContainer.create();
  const federated = [];
  for (const p of posts) {
    const slash = p.id.indexOf('/');
    const lang = p.id.slice(0, slash);
    if (!(locales as readonly string[]).includes(lang)) continue;

    const { Content } = await render(p);
    const content = absolutise(await container.renderToString(Content));

    federated.push({
      lang,
      slug: p.id.slice(slash + 1),
      author: p.data.author,
      title: p.data.title,
      summary: p.data.summary ?? p.data.description,
      content,
      date: p.data.date.toISOString(),
      orig: p.data.lang ?? null, // the post's original language, if declared
    });
  }

  return new Response(JSON.stringify({ writers: [...writers.values()], posts: federated }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
