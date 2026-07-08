// kiosk — the rack. The static home fetches this and lays the papers out.
// Newest first; a small page. Metadata only — opening a paper fetches its body.

export async function handlePapers(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 24, 100);
  // Cursor: papers published strictly before this ISO timestamp — the rack asks
  // for the next, older page with it. Newest first.
  const before = url.searchParams.get('before');

  const cols = 'iri, url, title, summary, author, author_name, published, langs, title_map';
  const stmt = before
    ? env.FEDI_DB.prepare(
        `SELECT ${cols} FROM kiosk_papers WHERE published < ? ORDER BY published DESC LIMIT ?`,
      ).bind(before, limit)
    : env.FEDI_DB.prepare(
        `SELECT ${cols} FROM kiosk_papers ORDER BY published DESC LIMIT ?`,
      ).bind(limit);
  const { results } = await stmt.all();

  // langs / title_map are stored as JSON; hand them back parsed.
  const papers = results.map((p) => ({
    ...p,
    langs: p.langs ? JSON.parse(p.langs) : [],
    titleMap: p.title_map ? JSON.parse(p.title_map) : null,
    title_map: undefined,
  }));

  return new Response(JSON.stringify({ papers }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
}
