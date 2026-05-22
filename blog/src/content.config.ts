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
  }),
});

export const collections = { posts };
