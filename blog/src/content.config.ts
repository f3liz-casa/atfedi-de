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
    description: z.string(),
    date: z.coerce.date(),
    // The author id — a folder name under content/authors/ (e.g. nyanrus).
    // The displayed name comes from that author's entry; see below.
    author: z.string(),
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
