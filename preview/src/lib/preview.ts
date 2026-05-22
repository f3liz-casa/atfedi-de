// Live preview — load a blog post straight from GitHub and render it.
//
// Used by the SSR route src/pages/v/preview/[...path].astro. {ref} is a
// branch name, or `pr-{number}` for a pull request (which may live in a
// fork). `/-/` separates the ref from the content path, so a branch name
// may contain slashes.
//
// The post is rendered with Markdoc's core renderer. Its default tokenizer
// keeps markdown-it's `html: false`, so raw HTML in a post is escaped to
// text — a PR's contents are not trusted.

import Markdoc from '@markdoc/markdoc';

// The catalog repo. A PR may live in a fork — resolveRef returns the head.
const REPO = { owner: 'f3liz-casa', repo: 'atfedi-de' };
// Posts sit here; a content path is {lang}/{slug} under it, like the URL.
const POSTS_BASE = 'blog/src/content/posts';

export interface PreviewOk {
  ok: true;
  ref: string;
  refLabel: string;
  lang: string;
  slug: string;
  title: string;
  date: string;
  html: string;
}

export interface PreviewErr {
  ok: false;
  status: number;
  message: string;
  detail?: string;
  ref?: string;
  lang?: string;
  slug?: string;
}

export type PreviewResult = PreviewOk | PreviewErr;

interface Source {
  owner: string;
  repo: string;
  sha: string;
  label: string;
}

// The .mdoc frontmatter is a few plain key: value lines — title,
// description, date. A small line parser is enough; no YAML library.
function parseFrontmatter(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

// A ref → where its content actually lives. `pr-{n}` asks GitHub for the
// PR's head; anything else is a branch name. The mapping isn't pinned, so
// it is cached only briefly.
async function resolveRef(ref: string, token?: string): Promise<Source | null> {
  const headers: Record<string, string> = {
    'User-Agent': 'atfedi-de-preview',
    Accept: 'application/vnd.github+json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const cf = { cacheTtl: 30, cacheEverything: true };

  const pr = ref.match(/^pr-(\d+)$/);
  if (pr) {
    const r = await fetch(
      `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/pulls/${pr[1]}`,
      { headers, cf } as RequestInit,
    );
    if (!r.ok) return null;
    const data: any = await r.json();
    if (!data.head?.repo) return null;
    return {
      owner: data.head.repo.owner.login,
      repo: data.head.repo.name,
      sha: data.head.sha,
      label: `PR #${pr[1]} · ${data.head.ref}`,
    };
  }

  // a branch (or tag, or full SHA) — GitHub resolves it to a commit
  const r = await fetch(
    `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/commits/${ref}`,
    { headers, cf } as RequestInit,
  );
  if (!r.ok) return null;
  const data: any = await r.json();
  return { owner: REPO.owner, repo: REPO.repo, sha: data.sha, label: ref };
}

// The post file at a pinned SHA — immutable, so it caches for a long time.
async function fetchPost(src: Source, contentPath: string): Promise<string | null> {
  const file = `${POSTS_BASE}/${contentPath}.mdoc`;
  const r = await fetch(
    `https://raw.githubusercontent.com/${src.owner}/${src.repo}/${src.sha}/${file}`,
    { cf: { cacheTtl: 86400, cacheEverything: true } } as RequestInit,
  );
  if (!r.ok) return null;
  return r.text();
}

// pathParam is the [...path] — `{ref}/-/{lang}/{slug}`.
export async function loadPreview(
  pathParam: string,
  token?: string,
): Promise<PreviewResult> {
  const sep = pathParam.indexOf('/-/');
  if (sep === -1) {
    return {
      ok: false,
      status: 400,
      message: 'Expected /v/preview/{ref}/-/{lang}/{slug}.',
    };
  }
  const ref = pathParam.slice(0, sep);
  const contentPath = pathParam
    .slice(sep + 3)
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.mdoc$/, '');

  if (!ref || !contentPath.includes('/') || contentPath.includes('..')) {
    return {
      ok: false,
      status: 400,
      message: 'That ref or content path looks empty or unsafe.',
      ref,
    };
  }
  const lang = contentPath.slice(0, contentPath.indexOf('/'));
  const slug = contentPath.slice(lang.length + 1);

  let src: Source | null;
  try {
    src = await resolveRef(ref, token);
  } catch {
    src = null;
  }
  if (!src) {
    return {
      ok: false,
      status: 404,
      message:
        'Could not resolve that ref — no such branch or PR (or GitHub is rate-limiting).',
      detail: ref,
      ref,
      lang,
      slug,
    };
  }

  const raw = await fetchPost(src, contentPath);
  if (raw === null) {
    return {
      ok: false,
      status: 404,
      message: 'No post at that path on this ref.',
      detail: `${POSTS_BASE}/${contentPath}.mdoc`,
      ref,
      lang,
      slug,
    };
  }

  try {
    const ast = Markdoc.parse(raw);
    const fm = parseFrontmatter((ast.attributes.frontmatter as string) || '');
    // default config: no custom tags, default nodes, raw HTML escaped
    const html = Markdoc.renderers.html(Markdoc.transform(ast));
    return {
      ok: true,
      ref,
      refLabel: src.label,
      lang,
      slug,
      title: fm.title || slug,
      date: fm.date || '',
      html,
    };
  } catch (e) {
    return {
      ok: false,
      status: 502,
      message: `Markdoc could not render this post: ${(e as Error).message}`,
      ref,
      lang,
      slug,
    };
  }
}
