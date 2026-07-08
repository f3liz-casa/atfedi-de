import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One .mdoc file per post, under src/content/posts/.
// The file path is the URL:
//   posts/{lang}/{slug}.mdoc → /{lang}/{slug}  (everyday posts, multilingual)
//   posts/v/{slug}.mdoc      → /v/{slug}        (dev posts, English-only)
const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    // The URL-facing blurb — the HTML <meta description> and og:description
    // (search results, link unfurls).
    description: z.string(),
    // The fediverse-facing blurb — the AP Article's `summary`, which servers
    // like hackers.pub show as the "Read full article" preview card. Absent
    // falls back to `description` (see pages/ap/manifest.json.ts).
    summary: z.string().optional(),
    date: z.coerce.date(),
    // The author id — a folder name under content/authors/ (e.g. nyanrus).
    // The displayed name comes from that author's entry; see below.
    author: z.string(),
    // The post's original language, as a BCP-47 tag. When a post exists in
    // several languages, this is the one that becomes the AP Article's default
    // (no-language) face — what servers show when they don't localize. Only set
    // it when the original isn't Japanese; absent means ja.
    lang: z.string().optional(),
  }),
});

// One .mdoc file per author, under src/content/authors/{lang}/{id}.mdoc —
// same multilingual shape as posts, with English the fallback. The body is
// the bio (markdown, so links drop right in); the frontmatter carries the
// fediverse handle (the displayed id) and a small set of profile links.
const authors = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/authors' }),
  schema: z.object({
    handle: z.string(),
    name: z.string().optional(),
    // True when the author is an AI. Their posts carry a notice and a badge
    // linking to /{lang}/llm so readers can choose with open eyes.
    ai: z.boolean().optional(),
    links: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          icon: z.string().optional(), // path to a custom icon in public/
        }),
      )
      .optional(),
  }),
});

export const collections = { posts, authors };
