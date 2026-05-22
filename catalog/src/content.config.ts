import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// A link is either a plain URL, or per-locale URLs for sites that have
// language-specific pages. When localized, it is resolved against the
// viewer's language (falling back to English) — see resolveUrl in i18n/utils.
const localizedUrl = z.union([
  z.url(),
  z.object({
    en: z.url(),
    ja: z.url().optional(),
    ko: z.url().optional(),
  }),
]);

// One YAML file per tool, under src/content/tools/.
//
// Metadata (name, links, category) is language-independent — written once.
// Only `summary` is translated; `ja` and `ko` are optional and fall back to
// `en` at render time. This keeps a three-language catalog sustainable.
const tools = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    lane: z.enum(['use', 'build']),
    category: z.enum([
      'client',
      'bridge',
      'discovery',
      'service',
      'utility',
      'framework',
      'relay',
      'toolkit',
    ]),
    summary: z.object({
      en: z.string(),
      ja: z.string().optional(),
      ko: z.string().optional(),
    }),
    links: z.object({
      home: localizedUrl,
      repo: localizedUrl.optional(),
      docs: localizedUrl.optional(),
    }),
    license: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Set true for a service that has shut down — it stays listed, but marked.
    discontinued: z.boolean().default(false),
  }),
});

export const collections = { tools };
