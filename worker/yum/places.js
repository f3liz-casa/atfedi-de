// yum.atfedi.de/places.json — the pins, as the map reads them.
//
// This is the seam the static site was written against: the front end fetches
// /places.json and draws whatever it finds, so nothing in the page changes when
// the pins start arriving from the fediverse instead of from a file.
//
// Returns null when there's nothing to serve yet — no table, or no pins — and
// the Worker falls through to the static seed. So the map is never blank while
// the first real pin is still on its way.

export async function handlePlaces(env) {
  let results;
  try {
    ({ results } = await env.FEDI_DB.prepare(
      `SELECT name, name_local, lat, lng, rating, note, note_local, by_handle, post_url
         FROM yum_pins
        ORDER BY created_at DESC
        LIMIT 2000`,
    ).all());
  } catch {
    return null; // the table isn't there yet — the seed still stands in
  }
  if (!results?.length) return null;

  const places = results.map((r) => ({
    name: r.name ?? 'この辺',
    // 読める人には要らない、読めない人にはこれだけの橋 — 無ければ黙って省く。
    // どちらも渡すだけで、どちらを出すかは読む側(app.js)が言語で決める。
    nameLocal: r.name_local || undefined,
    lat: r.lat,
    lng: r.lng,
    rating: r.rating,
    note: r.note ?? '',
    noteLocal: r.note_local || undefined,
    by: r.by_handle ?? '',
    src: r.post_url ?? '',
  }));

  return new Response(JSON.stringify({ places, areas: [] }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Pins arrive one at a time; a minute of staleness is kinder than a
      // query per visitor.
      'cache-control': 'public, max-age=60',
    },
  });
}
