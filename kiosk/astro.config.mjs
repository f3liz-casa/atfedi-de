import { defineConfig } from 'astro/config';

// kiosk.atfedi.de — the newsstand. A tiny reader for Articles and Notes from
// elsewhere on the fediverse: paste an address, the Worker fetches + sanitizes
// it (kiosk.atfedi.de/ap/read), and this page renders it. One page, language
// picked from the browser, fully static. Built into ../dist/kiosk; the monorepo
// Worker serves kiosk.atfedi.de from there.
//
// It only reads — no inbox, nothing to follow, no state. That's the whole point
// of keeping it apart from blog (the publishing actor).
export default defineConfig({
  site: 'https://kiosk.atfedi.de',
  outDir: '../dist/kiosk',
  // The stylesheet is tiny; inlining it drops the one render-blocking request.
  build: { inlineStylesheets: 'always' },
});
