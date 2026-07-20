// kiosk — the rack. The static home fetches this and lays the papers out.
// Newest first; a small page. Metadata only — opening a paper fetches its body.
//
// Papers carry whatever tags a person put on them from the console; `?tag=`
// narrows the rack to one shelf.

import { tagsForMany } from './tags.js';

/** How many papers nobody has tagged yet — the console's work left to do. */
export async function countUntagged(db) {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM kiosk_papers p
       WHERE NOT EXISTS (SELECT 1 FROM kiosk_tags u WHERE u.iri = p.iri)`,
    )
    .first();
  return row?.n ?? 0;
}

export async function handlePapers(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 24, 100);
  // Cursor: papers published strictly before this ISO timestamp — the rack asks
  // for the next, older page with it. Newest first.
  const before = url.searchParams.get('before');
  // One shelf only, if asked. Normalised the way the console stores tags, so a
  // link with odd casing still finds its shelf.
  const tag =
    (url.searchParams.get('tag') ?? '').trim().replace(/\s+/g, ' ').toLowerCase() || null;
  // Papers nobody has tagged yet — how the console finds what still needs a
  // person's eye. Public, but only interesting to whoever is doing the tagging.
  const untagged = url.searchParams.get('untagged') === '1';

  const cols =
    'p.iri, p.url, p.title, p.summary, p.author, p.author_name, p.published, p.langs, p.title_map';
  // Asking for a tag joins the shelf; otherwise the rack is the plain table.
  const from = tag
    ? 'kiosk_papers p JOIN kiosk_tags t ON t.iri = p.iri AND t.tag = ?'
    : 'kiosk_papers p';

  const conds = [];
  const binds = tag ? [tag] : [];
  if (before) {
    conds.push('p.published < ?');
    binds.push(before);
  }
  if (untagged) conds.push('NOT EXISTS (SELECT 1 FROM kiosk_tags u WHERE u.iri = p.iri)');
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  binds.push(limit);

  const { results } = await env.FEDI_DB.prepare(
    `SELECT ${cols} FROM ${from} ${where} ORDER BY p.published DESC LIMIT ?`,
  )
    .bind(...binds)
    .all();

  // Tags for the whole page in one query, not one round-trip per paper.
  const byIri = await tagsForMany(
    env.FEDI_DB,
    results.map((p) => p.iri),
  );

  // langs / title_map are stored as JSON; hand them back parsed.
  const papers = results.map((p) => ({
    ...p,
    langs: p.langs ? JSON.parse(p.langs) : [],
    titleMap: p.title_map ? JSON.parse(p.title_map) : null,
    title_map: undefined,
    tags: byIri.get(p.iri) ?? [],
  }));

  return new Response(JSON.stringify({ papers }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
}
