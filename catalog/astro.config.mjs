import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// atfedi.de — a catalog of fediverse tools.
//
// Output is fully static (every route uses getStaticPaths), so it deploys to
// Cloudflare Pages as plain assets — no adapter needed yet. When a server
// island or SSR is added later, install @astrojs/cloudflare and set an adapter.
//
// i18n is hand-rolled in src/i18n/ over [lang] routes — small and explicit,
// rather than relying on the built-in i18n config.
export default defineConfig({
  site: 'https://atfedi.de',
  integrations: [svelte()],
});
