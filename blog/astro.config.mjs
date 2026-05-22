import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';

// atfedi.de blog — the "other world". Markdoc content, path-based i18n
// (/{lang}/{slug} for everyday posts, /v/{slug} for dev posts).
//
// Built into ../dist/blog so the monorepo Worker serves it at blog.atfedi.de.
export default defineConfig({
  site: 'https://blog.atfedi.de',
  outDir: '../dist/blog',
  integrations: [markdoc()],
});
