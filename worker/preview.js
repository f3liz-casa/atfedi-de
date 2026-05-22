// blog.atfedi.de/v/preview/{ref}/-/{...path}
//
// A live preview of a blog post straight from GitHub — before it is built
// and published. {ref} is a branch name, or `pr-{number}` for a pull
// request (those can come from a fork). `/-/` separates the ref from the
// content path, so branch names may contain slashes.
//
// The content is rendered with Markdoc's core renderer right here in the
// Worker. Markdoc's default tokenizer keeps markdown-it's `html: false`,
// so raw HTML in a post is escaped to text — a PR's contents are not
// trusted, and this is the safety we leaned on when choosing Markdoc.
//
// A preview is "close enough to production", not byte-identical with the
// Astro build. Every preview response is noindex.

import Markdoc from '@markdoc/markdoc';

// The catalog repo. A PR may live in a fork — resolveRef returns the head.
const REPO = { owner: 'f3liz-casa', repo: 'atfedi-de' };
// Posts sit here; a content path is {lang}/{slug} under it, like the URL.
const POSTS_BASE = 'blog/src/content/posts';

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );
}

// The .mdoc frontmatter is a few plain key: value lines — title,
// description, date. A small line parser is enough; no YAML library.
function parseFrontmatter(text) {
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

// A ref → where its content actually lives: { owner, repo, sha, label }.
// `pr-{n}` asks GitHub for the PR's head; anything else is a branch name.
// The mapping isn't pinned, so it is cached only briefly.
async function resolveRef(ref, env) {
  const headers = {
    'User-Agent': 'atfedi-de-preview',
    Accept: 'application/vnd.github+json',
  };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  const cf = { cacheTtl: 30, cacheEverything: true };

  const pr = ref.match(/^pr-(\d+)$/);
  if (pr) {
    const r = await fetch(
      `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/pulls/${pr[1]}`,
      { headers, cf },
    );
    if (!r.ok) return null;
    const data = await r.json();
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
    { headers, cf },
  );
  if (!r.ok) return null;
  const data = await r.json();
  return { owner: REPO.owner, repo: REPO.repo, sha: data.sha, label: ref };
}

// The post file at a pinned SHA — immutable, so it caches for a long time.
async function fetchPost(src, contentPath) {
  const file = `${POSTS_BASE}/${contentPath}.mdoc`;
  const r = await fetch(
    `https://raw.githubusercontent.com/${src.owner}/${src.repo}/${src.sha}/${file}`,
    { cf: { cacheTtl: 86400, cacheEverything: true } },
  );
  if (!r.ok) return null;
  return r.text();
}

const STYLE = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font: 1.06rem/1.7 -apple-system, "Segoe UI", system-ui, sans-serif;
  color: #1a1a1a;
  background: #fbfbf9;
}
.banner {
  font-size: .8rem;
  letter-spacing: .02em;
  padding: .55rem 1.4rem;
  background: #1a1a1a;
  color: #fbfbf9;
}
.banner b { font-weight: 600; }
.banner .ref { opacity: .7; }
main { max-width: 38rem; margin: 0 auto; padding: 3rem 1.4rem 6rem; }
.post-head { margin-bottom: 2.4rem; }
.post-head h1 { font-size: 1.7rem; line-height: 1.3; margin: 0 0 .4rem; }
.post-head time { font-size: .85rem; color: #6a6a66; }
article { word-break: keep-all; }
article h2 { font-size: 1.25rem; margin: 2.4rem 0 .8rem; }
article h3 { font-size: 1.08rem; margin: 1.8rem 0 .6rem; }
article p, article ul, article ol { margin: 0 0 1.1rem; }
article a { color: #1a1a1a; text-underline-offset: .15em; }
article code {
  font-size: .9em;
  background: #efefe9;
  padding: .1em .35em;
  border-radius: 3px;
}
article pre {
  background: #efefe9;
  padding: 1rem 1.1rem;
  border-radius: 5px;
  overflow-x: auto;
}
article pre code { background: none; padding: 0; }
article blockquote {
  margin: 0 0 1.1rem;
  padding-left: 1rem;
  border-left: 2px solid #d6d6cf;
  color: #555;
}
.problem {
  margin: 2rem auto;
  max-width: 38rem;
  padding: 0 1.4rem;
  color: #6a6a66;
}
.problem code { font-size: .9em; }
`.trim();

function page({ title, banner, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} · preview</title>
<style>${STYLE}</style>
</head>
<body>
<div class="banner">${banner}</div>
${body}
</body>
</html>`;
}

function previewResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // noindex on the header too — belt and braces
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

function problem(message, refLabel, status) {
  return previewResponse(
    page({
      title: 'preview',
      banner: `<b>preview</b> — couldn't render`,
      body: `<div class="problem"><p>${message}</p>${
        refLabel ? `<p class="ref">ref: <code>${escapeHtml(refLabel)}</code></p>` : ''
      }</div>`,
    }),
    status,
  );
}

// rest is the path after `/v/preview/` — `{ref}/-/{...content path}`.
export async function handlePreview(rest, env) {
  const sep = rest.indexOf('/-/');
  if (sep === -1) {
    return problem(
      'Expected <code>/v/preview/{ref}/-/{lang}/{slug}</code>.',
      null,
      400,
    );
  }
  const ref = rest.slice(0, sep);
  const contentPath = rest
    .slice(sep + 3)
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.mdoc$/, '');

  if (!ref || !contentPath || contentPath.includes('..')) {
    return problem('That ref or content path looks empty or unsafe.', ref, 400);
  }

  let src;
  try {
    src = await resolveRef(ref, env);
  } catch {
    src = null;
  }
  if (!src) {
    return problem(
      `Couldn't resolve <code>${escapeHtml(ref)}</code> — no such branch or PR (or GitHub is rate-limiting).`,
      ref,
      404,
    );
  }

  const raw = await fetchPost(src, contentPath);
  if (raw === null) {
    return problem(
      `No post at <code>${escapeHtml(`${POSTS_BASE}/${contentPath}.mdoc`)}</code> on this ref.`,
      src.label,
      404,
    );
  }

  let bodyHtml;
  let fm;
  try {
    const ast = Markdoc.parse(raw);
    fm = parseFrontmatter(ast.attributes.frontmatter || '');
    // default config: no custom tags, default nodes, raw HTML escaped.
    // renderers.html already wraps the document in <article>.
    bodyHtml = Markdoc.renderers.html(Markdoc.transform(ast));
  } catch (e) {
    return problem(`Markdoc couldn't render this post: ${escapeHtml(e.message)}`, src.label, 502);
  }

  const title = fm.title || contentPath;
  return previewResponse(
    page({
      title,
      banner: `<b>preview</b> · <span class="ref">${escapeHtml(src.label)}</span> · not indexed`,
      body: `<main>
<header class="post-head">
<h1>${escapeHtml(title)}</h1>
${fm.date ? `<time>${escapeHtml(fm.date)}</time>` : ''}
</header>
${bodyHtml}
</main>`,
    }),
  );
}
