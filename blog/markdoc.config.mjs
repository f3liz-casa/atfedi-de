import { defineMarkdocConfig } from '@astrojs/markdoc/config';
import shiki from '@astrojs/markdoc/shiki';

// Code blocks are highlighted at build time. The css-variables theme leaves
// the colors to blog.css (--astro-code-*), so the palette stays the site's.
export default defineMarkdocConfig({
  extends: [
    shiki({
      theme: 'css-variables',
    }),
  ],
});
