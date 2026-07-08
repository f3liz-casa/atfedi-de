// Turning a blog post into ActivityPub. The Article is derived on the fly from
// the manifest posts — nothing article-shaped is stored; the posts are the truth.
// The canonical reading experience stays the web page, so the AP content is the
// full body plus a link home.
//
// A post that exists in several languages federates as ONE Article carrying a
// nameMap / contentMap (one entry per language), the way Hackers' Pub does it —
// so a remote reader shows it in their own language rather than seeing a separate
// copy per language. The id is per-slug, not per-language.

import { Article, Create, Update, LanguageString, PUBLIC_COLLECTION } from '@fedify/fedify/vocab';
import { Temporal } from '@js-temporal/polyfill';

const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** The AP id of a writer's post (per slug) — also its dereferenceable URL. */
export function articleUri(ctx, identifier, slug) {
  return ctx.getObjectUri(Article, { identifier, slug });
}

// The rendered body of one translation, with a link home at the end. Falls back
// to the lede if a post has no rendered body.
function bodyWithLink(slug, t) {
  const canonical = `https://blog.atfedi.de/${t.lang}/${slug}/`;
  const body = t.content ?? `<p>${escapeHtml(t.summary)}</p>`;
  return `${body}\n<p><a href="${canonical}">${canonical}</a></p>`;
}

// `updated` (an ISO string) marks an edit — set it when re-sending via Update so
// receivers know to refresh; left off for the first Create and the dispatcher.
export function buildArticle(ctx, identifier, slug, translations, updated) {
  // The default (no-language) face is the article's original language: declared
  // via a post's frontmatter `lang:`, else Japanese, else whatever sorts first.
  // Servers that don't localize (Hackers' Pub's preview, etc.) show this one.
  const orig = translations.find((t) => t.orig)?.orig ?? 'ja';
  const primary = translations.find((t) => t.lang === orig) ?? translations[0];
  return new Article({
    id: articleUri(ctx, identifier, slug),
    attribution: ctx.getActorUri(identifier),
    updated: updated ? Temporal.Instant.from(updated) : undefined,
    // The bare title/body (no language) is the default; the LanguageStrings
    // become the nameMap / contentMap.
    names: [primary.title, ...translations.map((t) => new LanguageString(t.title, t.lang))],
    // The summary is the article's face on servers that preview instead of
    // inlining the body (Hackers' Pub shows it, then links home) — so it carries
    // a language map too, like the title and body.
    summaries: [primary.summary, ...translations.map((t) => new LanguageString(t.summary, t.lang))],
    contents: [
      bodyWithLink(slug, primary),
      ...translations.map((t) => new LanguageString(bodyWithLink(slug, t), t.lang)),
    ],
    url: new URL(`https://blog.atfedi.de/${primary.lang}/${slug}/`),
    published: Temporal.Instant.from(primary.date),
    tos: [PUBLIC_COLLECTION],
    ccs: [ctx.getFollowersUri(identifier)],
  });
}

export function buildCreate(ctx, identifier, slug, translations) {
  return new Create({
    id: new URL(`#create/${slug}`, ctx.getActorUri(identifier)),
    actor: ctx.getActorUri(identifier),
    object: buildArticle(ctx, identifier, slug, translations),
    tos: [PUBLIC_COLLECTION],
    ccs: [ctx.getFollowersUri(identifier)],
  });
}

// Re-send an already-published article so followers refresh their copy. Unlike
// Create (idempotent, one per slug), each Update carries a fresh id and stamp so
// it isn't deduplicated away.
export function buildUpdate(ctx, identifier, slug, translations, stamp) {
  return new Update({
    id: new URL(`#update/${slug}/${encodeURIComponent(stamp)}`, ctx.getActorUri(identifier)),
    actor: ctx.getActorUri(identifier),
    object: buildArticle(ctx, identifier, slug, translations, stamp),
    tos: [PUBLIC_COLLECTION],
    ccs: [ctx.getFollowersUri(identifier)],
  });
}
