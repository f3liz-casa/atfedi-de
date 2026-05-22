# atfedi.de

A catalog of fediverse tools — sister site to
[joinfediverse.kr](https://joinfediverse.kr).

joinfediverse.kr is the doorway: *what is the fediverse, how do I start?*
atfedi.de is the next layer: *now, which software, which app, which tool?*

## The two lanes

Tools for **using** the fediverse and tools for **building** it barely
overlap, so the site keeps them on separate lanes rather than mixing them:

- `/[lang]/use` — clients, bridges, and other tools you use on the fediverse
- `/[lang]/build` — frameworks, relays, toolkits

Platforms themselves (Mastodon, Misskey, …) are intentionally out of scope —
choosing a platform to join is the sister site joinfediverse.kr's job.

The home page is a short intro plus the two doors.

## Stack

- **Astro 6** — static output, deploys to Cloudflare Pages with no adapter.
- **Svelte 5** — used for interactive islands (currently the category filter).
- Three languages: `en`, `ja`, `ko`. i18n is hand-rolled in `src/i18n/`.
  Copy is written per language — see `docs/writing.md`, with Korean-specific
  pitfalls in `docs/translation-ko.md`.
  Japanese line breaks are preprocessed with BudouX at build time; Korean
  uses `word-break: keep-all`. Long text renders through `components/Phrase.astro`.
- Fonts: Source Sans 3 for Latin; BIZ UDPGothic (ja) and Nanum Gothic (ko)
  appended per locale. CJK font files load only on their own language pages.

## Commands

```sh
npm install
npm run dev      # local dev server
npm run build    # static build to dist/
npm run preview  # serve the build
npm run check    # type-check
```

## Adding a tool

Drop one YAML file into `src/content/tools/`. The schema lives in
`src/content.config.ts`. Name, links, and category are written once; only
`summary` is translated, and `ja` / `ko` are optional — a missing translation
falls back to English.

```yaml
name: Example
lane: use            # use | build
category: client     # client | bridge | discovery | service | utility
                     # framework | relay | toolkit
summary:
  en: One sentence in English.
  ja: 日本語の一文（任意）。
links:
  home: https://example.org
  repo: https://github.com/example/example   # optional
license: MIT          # optional
tags: [web]           # optional — e.g. web, iOS, Android, extension
discontinued: true    # optional — marks a service that has shut down
```

Any link (`home` / `repo` / `docs`) may instead be a set of per-locale URLs,
for a target site that has language-specific pages. The catalog then links to
the page matching the viewer's language, falling back to `en`:

```yaml
links:
  home:
    en: https://example.org/en/
    ja: https://example.org/ja/
    ko: https://example.org/ko/
```

## Shared styling — so the future app can reuse it

All visual styling lives in `src/styles/` as **plain, framework-agnostic CSS**:

- `tokens.css` — design tokens (colors, fonts, spacing) as CSS custom properties
- `base.css` — reset, element defaults, layout helpers
- `components.css` — component classes (`.tool-card`, `.chip`, `.lane-door`, …)

Component visuals are deliberately **not** placed in Astro scoped `<style>`
blocks or in Svelte `<style>` blocks. They are plain classes. That means:

- the Svelte island (`ToolFilter.svelte`) already reuses them, with no `<style>`
  block of its own;
- a future standalone Svelte / SvelteKit app can `import` these three CSS files
  unchanged and get the identical look.

When adding UI, keep this rule: put shared visuals in `src/styles/`, not inside
a single component.

## Structure

```
src/
  content.config.ts      tool collection schema
  content/tools/         one YAML file per tool
  i18n/                  ui strings + translation helpers
  styles/                framework-agnostic CSS (see above)
  layouts/Base.astro     html shell, header, footer, fonts
  components/            ToolCard.astro, ToolFilter.svelte
  pages/
    index.astro          root — redirects to the visitor's language
    [lang]/index.astro   home: intro + the two doors
    [lang]/[lane].astro  catalog for one lane (use | build)
```
