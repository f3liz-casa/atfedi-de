// A KvStore for fedify, backed by the same D1 as everything else — so there's
// one store, not two. fedify uses it for caching and inbox idempotency; both
// are best-effort here, since our real safety net is D1's primary keys.
//
// Keys are JSON-encoded arrays (fedify's KvKey). Like Cloudflare's own KV
// store, this one skips `cas` — fedify does without it.

// Escape LIKE wildcards; fedify's keys start with "_fedify", so `_` is real.
const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => '\\' + c);

export class D1KvStore {
  #db;

  constructor(db) {
    this.#db = db;
  }

  #enc(key) {
    return JSON.stringify(key);
  }

  async get(key) {
    const row = await this.#db
      .prepare('SELECT v, expires FROM kv WHERE k = ?')
      .bind(this.#enc(key))
      .first();
    if (!row) return undefined;
    if (row.expires != null && row.expires < Date.now()) return undefined;
    return JSON.parse(row.v);
  }

  async set(key, value, options) {
    const expires =
      options?.ttl == null ? null : Date.now() + options.ttl.total('milliseconds');
    await this.#db
      .prepare(
        `INSERT INTO kv (k, v, expires) VALUES (?, ?, ?)
         ON CONFLICT(k) DO UPDATE SET v = excluded.v, expires = excluded.expires`,
      )
      .bind(this.#enc(key), JSON.stringify(value), expires)
      .run();
  }

  async delete(key) {
    await this.#db.prepare('DELETE FROM kv WHERE k = ?').bind(this.#enc(key)).run();
  }

  async *list(prefix) {
    const now = Date.now();
    // The encoded prefix is the JSON array with its closing bracket dropped, so
    // children ('["_fedify","x"]') match. The exact key is fetched separately.
    const empty = prefix == null || prefix.length === 0;
    const pattern = empty ? '[' : this.#enc(prefix).slice(0, -1) + ',';

    if (!empty) {
      const exact = await this.#db
        .prepare('SELECT k, v, expires FROM kv WHERE k = ?')
        .bind(this.#enc(prefix))
        .first();
      if (exact && (exact.expires == null || exact.expires >= now)) {
        yield { key: JSON.parse(exact.k), value: JSON.parse(exact.v) };
      }
    }

    const { results } = await this.#db
      .prepare("SELECT k, v, expires FROM kv WHERE k LIKE ? ESCAPE '\\'")
      .bind(escapeLike(pattern) + '%')
      .all();
    for (const row of results ?? []) {
      if (row.expires != null && row.expires < now) continue;
      yield { key: JSON.parse(row.k), value: JSON.parse(row.v) };
    }
  }
}
