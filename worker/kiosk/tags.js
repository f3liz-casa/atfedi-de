// kiosk — the hand-written tags on a paper.
//
// The sweep decides what arrives on the rack; a person decides what a paper is
// *about*. That second part is only ever typed by hand from the console, so the
// rules live here rather than at either caller: one place says what a tag is.

// A tag as stored: trimmed, lowercased, inner whitespace collapsed. Typing
// "Fediverse " and "fediverse" should not make two tags. Case is folded rather
// than preserved because the rack shows tags as written by no one in
// particular — they're a shelf label, not a quotation.
export function normalizeTag(raw) {
  const tag = String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
  // A cap so a pasted paragraph can't become a tag; empty means "not a tag".
  return tag.length === 0 || tag.length > 48 ? null : tag;
}

/** Every tag on one paper, alphabetical. */
export async function tagsFor(db, iri) {
  const { results } = await db
    .prepare('SELECT tag FROM kiosk_tags WHERE iri = ? ORDER BY tag')
    .bind(iri)
    .all();
  return results.map((r) => r.tag);
}

/** Tags for many papers at once, as iri → [tag]. The rack needs this per page,
 *  and one query per paper would be a stack of round-trips for no reason. */
export async function tagsForMany(db, iris) {
  if (iris.length === 0) return new Map();
  const holes = iris.map(() => '?').join(', ');
  const { results } = await db
    .prepare(`SELECT iri, tag FROM kiosk_tags WHERE iri IN (${holes}) ORDER BY tag`)
    .bind(...iris)
    .all();
  const byIri = new Map();
  for (const r of results) {
    if (!byIri.has(r.iri)) byIri.set(r.iri, []);
    byIri.get(r.iri).push(r.tag);
  }
  return byIri;
}

/** Put a tag on a paper. Returns the normalised tag, or null if it wasn't one.
 *  Tagging the same paper twice just refreshes nothing — the pair is the key. */
export async function addTag(db, iri, raw, addedBy) {
  const tag = normalizeTag(raw);
  if (!tag) return null;
  await db
    .prepare(
      `INSERT INTO kiosk_tags (iri, tag, added_by, added_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(iri, tag) DO NOTHING`,
    )
    .bind(iri, tag, addedBy ?? null, new Date().toISOString())
    .run();
  return tag;
}

/** Take a tag off a paper. */
export async function removeTag(db, iri, raw) {
  const tag = normalizeTag(raw);
  if (!tag) return null;
  await db.prepare('DELETE FROM kiosk_tags WHERE iri = ? AND tag = ?').bind(iri, tag).run();
  return tag;
}

/** Every tag in use, with how many papers carry it — the console offers these
 *  as suggestions, so a vocabulary can settle without anyone declaring one. */
export async function listTags(db) {
  const { results } = await db
    .prepare(
      `SELECT tag, COUNT(*) AS count FROM kiosk_tags
       GROUP BY tag ORDER BY count DESC, tag`,
    )
    .all();
  return results;
}
