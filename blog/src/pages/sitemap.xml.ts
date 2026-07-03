import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { locales } from '../locales';

// The whole blog in one sitemap: per-locale homes and fixed pages, author
// profiles, and every post (with its publish date as lastmod).
const site = 'https://blog.atfedi.de';

const entry = (path: string, lastmod?: Date) =>
  `  <url><loc>${site}${path}</loc>${
    lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''
  }</url>`;

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const authors = await getCollection('authors');
  const authorIds = [...new Set(authors.map((a) => a.id.slice(a.id.indexOf('/') + 1)))];

  const urls: string[] = [];
  for (const lang of locales) {
    // The fixed pages every locale has — a new fixed page needs a line here.
    urls.push(entry(`/${lang}/`), entry(`/${lang}/llm/`));
    for (const id of authorIds) urls.push(entry(`/${lang}/by/${id}/`));
  }
  for (const post of posts) urls.push(entry(`/${post.id}/`, post.data.date));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
