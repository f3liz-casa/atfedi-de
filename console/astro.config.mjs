import { defineConfig } from 'astro/config';

// console.atfedi.de — the back room. Two desks: publishing the blog's posts to
// the fediverse, and putting tags on kiosk's papers by hand. Single page,
// English only (it's one person's tool), fully static — every bit of state
// comes from the Worker's /api/* on the same host. Built into ../dist/console;
// the monorepo Worker serves console.atfedi.de from there, behind a login.
export default defineConfig({
  site: 'https://console.atfedi.de',
  outDir: '../dist/console',
  build: { inlineStylesheets: 'always' },
});
