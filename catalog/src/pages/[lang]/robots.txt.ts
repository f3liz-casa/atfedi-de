import type { APIRoute } from 'astro';
import { locales } from '../../i18n/ui';

// One robots.txt per locale subdomain, pointing at that host's sitemap.
export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  const body = `User-agent: *
Allow: /

Sitemap: https://${params.lang}.atfedi.de/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
