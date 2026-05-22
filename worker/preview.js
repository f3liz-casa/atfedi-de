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
// The preview wears the real blog's skin: it borrows a built blog page as
// a skeleton (real header, footer, fonts, CSS) and swaps the post in with
// HTMLRewriter. The only thing the blog itself never has is the top band.
// Links in the blog's own nav are re-pointed under /v/preview/{ref}/-/ so
// the preview is its own little rooted world. Every response is noindex.

import Markdoc from '@markdoc/markdoc';

// The catalog repo. A PR may live in a fork — resolveRef returns the head.
const REPO = { owner: 'f3liz-casa', repo: 'atfedi-de' };
// Posts sit here; a content path is {lang}/{slug} under it, like the URL.
const POSTS_BASE = 'blog/src/content/posts';
// Locales that have a built blog home to borrow as a skeleton.
const BUILT_LOCALES = ['en', 'ja', 'ko'];

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

// The top band — the one thing the real blog never wears.
const BANNER_CSS =
  '.preview-banner{font:600 .78rem/1 -apple-system,"Segoe UI",system-ui,' +
  'sans-serif;letter-spacing:.03em;text-align:center;padding:.6rem 1rem;' +
  'background:#1a1a1a;color:#fbfbf9}';

function bannerHtml(label) {
  return `<div class="preview-banner">preview · ${escapeHtml(label)} · not indexed</div>`;
}

// The <main> content, mirroring blog/src/pages/[lang]/[...slug].astro —
// bodyHtml is Markdoc's render, which already wraps the post in <article>.
function articleMarkup(title, date, bodyHtml) {
  return (
    `<div class="wrap"><article class="post">` +
    `<header class="post-head"><h1>${escapeHtml(title)}</h1>` +
    (date ? `<time datetime="${escapeHtml(date)}">${escapeHtml(date)}</time>` : '') +
    `</header>${bodyHtml}</article></div>`
  );
}

function previewResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // noindex on the header too — belt and braces
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

// A plain standalone page — for errors, and for the rare locale with no
// built blog home to borrow.
function minimalPage({ title, banner, body, status = 200 }) {
  return previewResponse(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} · preview</title>
<style>${BANNER_CSS}
body{margin:0;font:1.05rem/1.7 -apple-system,"Segoe UI",system-ui,sans-serif;color:#1a1a1a;background:#fbfbf9}
main{max-width:38rem;margin:0 auto;padding:3rem 1.4rem 6rem}
.problem{max-width:38rem;margin:2.4rem auto;padding:0 1.4rem;color:#6a6a66}
.post-head h1{font-size:1.6rem;line-height:1.3;margin:0 0 .4rem}
.post-head time{font-size:.85rem;color:#6a6a66}
article a{color:#1a1a1a}
article pre,article code{background:#efefe9;border-radius:4px}
article pre{padding:1rem 1.1rem;overflow-x:auto}</style>
</head>
<body>
${banner}
${body}
</body>
</html>`,
    status,
  );
}

// rest is the path after `/v/preview/` — `{ref}/-/{...content path}`.
export async function handlePreview(rest, env, url) {
  const sep = rest.indexOf('/-/');
  if (sep === -1) {
    return errorPage(
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

  if (!ref || !contentPath.includes('/') || contentPath.includes('..')) {
    return errorPage('That ref or content path looks empty or unsafe.', ref, 400);
  }
  const lang = contentPath.slice(0, contentPath.indexOf('/'));
  const slug = contentPath.slice(lang.length + 1);

  let src;
  try {
    src = await resolveRef(ref, env);
  } catch {
    src = null;
  }
  if (!src) {
    return errorPage(
      `Couldn't resolve <code>${escapeHtml(ref)}</code> — no such branch or PR (or GitHub is rate-limiting).`,
      ref,
      404,
    );
  }

  const raw = await fetchPost(src, contentPath);
  if (raw === null) {
    return errorPage(
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
    // default config: no custom tags, default nodes, raw HTML escaped
    bodyHtml = Markdoc.renderers.html(Markdoc.transform(ast));
  } catch (e) {
    return errorPage(
      `Markdoc couldn't render this post: ${escapeHtml(e.message)}`,
      src.label,
      502,
    );
  }

  const title = fm.title || slug;
  const article = articleMarkup(title, fm.date, bodyHtml);

  // Borrow the real built blog home for this locale as a skeleton — its
  // header, footer, fonts and CSS are the genuine article.
  let skeleton = null;
  if (BUILT_LOCALES.includes(lang)) {
    const s = await env.ASSETS.fetch(new Request(new URL(`/blog/${lang}/`, url)));
    if (s.ok && s.headers.get('content-type')?.includes('text/html')) {
      skeleton = s;
    }
  }
  // No skeleton (an unbuilt locale, or assets missing) — stand alone.
  if (!skeleton) {
    return minimalPage({
      title,
      banner: bannerHtml(src.label),
      body: `<main>${article}</main>`,
    });
  }

  const prefix = `/v/preview/${ref}/-/`;
  const rewriter = new HTMLRewriter()
    .on('title', {
      element(e) {
        e.setInnerContent(`${title} · preview`);
      },
    })
    .on('head', {
      element(e) {
        e.append('<meta name="robots" content="noindex, nofollow">', { html: true });
        e.append(`<style>${BANNER_CSS}</style>`, { html: true });
      },
    })
    .on('body', {
      element(e) {
        e.prepend(bannerHtml(src.label), { html: true });
      },
    })
    .on('main', {
      element(e) {
        e.setInnerContent(article, { html: true });
      },
    })
    // the blog's own language switcher → stay inside this preview world
    .on('.lang-switch a', {
      element(e) {
        const href = e.getAttribute('href') || '';
        const m = href.match(/^\/(en|ja|ko)\//);
        if (m) e.setAttribute('href', `${prefix}${m[1]}/${slug}`);
      },
    });

  return new Response(rewriter.transform(skeleton).body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

// A friendly error, in the same plain page — still noindex.
function errorPage(message, refLabel, status) {
  return minimalPage({
    title: 'preview',
    banner: bannerHtml('—'),
    body:
      `<div class="problem"><p>${message}</p>` +
      (refLabel ? `<p>ref: <code>${escapeHtml(refLabel)}</code></p>` : '') +
      `</div>`,
    status,
  });
}
