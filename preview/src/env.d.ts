/// <reference types="astro/client" />

// Worker bindings — read via `import { env } from 'cloudflare:workers'`.
interface Env {
  // Optional — raises the GitHub API rate limit. The repo is public, so
  // the preview works without it.
  GITHUB_TOKEN?: string;
}
