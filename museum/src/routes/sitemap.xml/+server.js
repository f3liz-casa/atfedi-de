import { roomIds } from '$lib/rooms.server.js';

export const prerender = true;

const BASE = 'https://museum.atfedi.de';
const SEC = '/section/fedify';

export function GET() {
  const urls = ['/', `${SEC}/`, `${SEC}/rooms/guide/`, `${SEC}/rooms/kotoba/`,
    ...roomIds.map((id) => `${SEC}/rooms/${id}/`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${BASE}${u}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
