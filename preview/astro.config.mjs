import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// The live preview — a one-route SSR project, kept separate from the
// static blog so the blog still builds as plain static files (the
// Cloudflare adapter's static prerender does not run here: there are no
// prerendered routes). This renders /v/preview/{ref}/-/{lang}/{slug} on
// demand, wearing the blog's own Base.astro.
//
// Built into ../dist/preview; the monorepo Worker bundles the emitted
// _worker.js and hands it every /v/preview/* request.
export default defineConfig({
  site: 'https://blog.atfedi.de',
  outDir: '../dist/preview',
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
});
