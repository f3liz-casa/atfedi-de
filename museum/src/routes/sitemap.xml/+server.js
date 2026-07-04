import { roomIds } from '$lib/rooms.server.js';
import { LANGS } from '$lib/i18n.js';

export const prerender = true;

const BASE = 'https://museum.atfedi.de';

export function GET() {
  const urls = LANGS.flatMap((lang) => {
    const SEC = `/${lang}/section/fedify`;
    return [`/${lang}/`, `${SEC}/`, `${SEC}/rooms/guide/`, `${SEC}/rooms/kotoba/`,
      ...roomIds.map((id) => `${SEC}/rooms/${id}/`)];
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${BASE}${u}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
