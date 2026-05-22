import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// atfedi.de — the catalog. Fully static (every route uses getStaticPaths).
//
// Built into ../dist/catalog so the monorepo Worker can serve every locale
// subdomain ({locale}.atfedi.de) from one combined assets directory.
//
// i18n is hand-rolled in src/i18n/ over [lang] routes; each [lang] subtree
// is served at its own subdomain by the Worker.
export default defineConfig({
  site: 'https://atfedi.de',
  outDir: '../dist/catalog',
  integrations: [svelte()],
});
