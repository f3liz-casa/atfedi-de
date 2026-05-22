import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';

// atfedi.de blog — the "other world". Markdoc content, path-based i18n
// (/{lang}/ homes, /{lang}/{slug} posts). Fully static — built into
// ../dist/blog.
//
// The live preview is a separate SSR project (../preview); the monorepo
// Worker serves this blog as static assets and hands /v/preview/* to that.
export default defineConfig({
  site: 'https://blog.atfedi.de',
  outDir: '../dist/blog',
  integrations: [markdoc()],
});
