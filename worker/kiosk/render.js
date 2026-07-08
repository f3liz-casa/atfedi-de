// Server-rendered reader page. A paper opened from the rack arrives as a real
// page navigation — kiosk.atfedi.de/{lang}/?url=<paper> — so we can render the
// paper into the shell here, at the edge, instead of shipping an empty page that
// then fetches /ap/read and shows a "fetching…" flash. Same fetch + sanitize as
// the JSON endpoint (shapeFromTarget); the difference is only where it lands —
// in the HTML, not in a later client fetch.
//
// If the paper can't be shaped (bad url, unreachable, not an Article/Note), we
// return null and the caller serves the plain shell — the client then fetches
// /ap/read and shows its own status, exactly as it did before SSR existed. So
// this is a pure speed-up on the happy path, never a new failure mode.

import { shapeFromTarget } from '../federation/read.js';

// Fill the reader-result block of the built shell with a shaped paper. The block
// carries stable, kiosk-only class names (.reader-title, .reader-body, …), so we
// address them directly; the body html is already sanitized upstream.
function injectArticle(shellRes, data) {
  const dateText = typeof data.published === 'string' ? data.published.slice(0, 10) : '';
  const langsText = Array.isArray(data.langs) ? data.langs.map((l) => l.toUpperCase()).join(' ') : '';
  const origHref = data.url || data.id || '#';
  const author = data.author;
  const authorName = author && (author.name || author.handle);
  const authorHref = (author && (author.url || author.uri)) || '#';

  const out = new HTMLRewriter()
    // A nicer tab/label than the newsstand's generic title.
    .on('title', { element(el) { if (data.title) el.setInnerContent(data.title); } })
    // Enter the focused reading layout up front — no flash of the rack first,
    // and it reads right even with JS off.
    .on('.kiosk-home', {
      element(el) {
        const c = el.getAttribute('class') || '';
        if (!/\breading\b/.test(c)) el.setAttribute('class', `${c} reading`.trim());
      },
    })
    .on('.reader-result', {
      element(el) {
        el.removeAttribute('hidden');
        // The reply box needs the paper's canonical id and human url; the client
        // reads these back on load instead of re-fetching.
        el.setAttribute('data-article-id', data.id || '');
        el.setAttribute('data-article-url', origHref);
      },
    })
    .on('.reader-title', { element(el) { el.setInnerContent(data.title || ''); } })
    .on('.reader-author', {
      element(el) {
        if (authorName) {
          el.setAttribute('href', authorHref);
          el.setInnerContent(authorName);
        } else {
          el.setAttribute('hidden', '');
        }
      },
    })
    .on('.reader-time', {
      element(el) {
        if (dateText) {
          el.setAttribute('datetime', data.published);
          el.setInnerContent(dateText);
        }
      },
    })
    .on('.reader-langs', { element(el) { el.setInnerContent(langsText); } })
    // Already sanitized in shapeReadResult — the one trusted html assignment.
    .on('.reader-body', { element(el) { el.setInnerContent(data.html || '', { html: true }); } })
    .on('.reader-original', { element(el) { el.setAttribute('href', origHref); } })
    // Reply-from-your-instance is available as soon as a paper is on screen.
    .on('.reply-box', { element(el) { el.removeAttribute('hidden'); } })
    .transform(shellRes);

  // Per-url and freshly fetched — same short window the JSON read uses.
  const headers = new Headers(out.headers);
  headers.set('cache-control', 'public, max-age=300');
  return new Response(out.body, { status: out.status, headers });
}

// Render kiosk.atfedi.de/{lang}/?url=<paper> into `shellRes` (the built page).
// Returns the rendered Response, or null to fall back to the plain shell.
export async function renderReadPage(request, env, ctx, shellRes, rawUrl, lang) {
  let target;
  try {
    target = new URL(rawUrl);
  } catch {
    return null;
  }
  if (target.protocol !== 'https:' && target.protocol !== 'http:') return null;

  const result = await shapeFromTarget(request, env, ctx, target, lang);
  if (result.error) return null;
  return injectArticle(shellRes, result.data);
}
