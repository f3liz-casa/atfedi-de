/// <reference types="astro/client" />

// Worker bindings — read via `import { env } from 'cloudflare:workers'`.
interface Env {
  // Optional — raises the GitHub API rate limit. The repo is public, so
  // the preview works without it.
  GITHUB_TOKEN?: string;
}

// The Workers runtime built-in. Resolved by the runtime / bundler; this
// declaration just gives `astro check` the type of what we import.
declare module 'cloudflare:workers' {
  export const env: Env;
}
