import { defineConfig } from 'astro/config';

// danro.atfedi.de — a tiny intro page for danro-talk, the chat widget
// this catalog itself uses. Single page, English only, fully static.
// Built into ../dist/danro; the monorepo Worker serves danro.atfedi.de
// from there.
export default defineConfig({
  site: 'https://danro.atfedi.de',
  outDir: '../dist/danro',
});
