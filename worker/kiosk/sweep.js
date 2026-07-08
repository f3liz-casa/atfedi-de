// kiosk — gathering Articles into the rack, the fediverse way.
//
// kiosk is a newsstand for *any* server, so it reads the one thing every
// ActivityPub server speaks: the actor's outbox. fedify (which blog.atfedi.de
// already federates with) resolves the actor, signs the requests, and hands us
// the activities; we keep the Articles and skip the rest. Nothing here is
// specific to one instance — point the seed at another server and the same walk
// works.
//
// The trade is that an outbox mixes Articles in among many more Notes, so we
// sweep gently: seed the account list once, then each cron tick walk a couple
// of accounts one page at a time, remembering the cursor, so a tick stays tiny
// (kind to the source, and well under the Worker's subrequest limit) and the
// backlog drains over many ticks. Upserts key on the Article's iri, so
// re-walking is harmless — a daily pass re-reads the top to catch new articles.

import { Create, Article } from '@fedify/fedify/vocab';
import { getFederation } from '../federation/index.js';
import { articleMeta } from '../federation/read.js';

// Where the rack gathers from today. The walk itself is server-agnostic; this
// is only the seed list's home (its sitemap of accounts).
export const SOURCE_HOST = 'hackers.pub';

const UA = 'kiosk.atfedi.de (+https://kiosk.atfedi.de; a fediverse reader)';

// One tick's budget — deliberately small. Each account first-touch costs an
// actor lookup plus a page fetch; keep the total subrequests well under 50.
const ACCOUNTS_PER_TICK = 3;
const PAGES_PER_ACCOUNT = 2;
// How far back the date frontier steps each time everyone has caught up.
const STEP_DAYS = 30;

const nowIso = () => new Date().toISOString();
const isoDaysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const isoStepBack = (iso, n) => new Date(new Date(iso).getTime() - n * 86400000).toISOString();

// The sweep's own small state (the date frontier lives here).
async function getState(env, k) {
  const row = await env.FEDI_DB.prepare('SELECT v FROM kiosk_state WHERE k = ?').bind(k).first();
  return row?.v ?? null;
}
async function setState(env, k, v) {
  await env.FEDI_DB.prepare(
    'INSERT INTO kiosk_state (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v',
  )
    .bind(k, v)
    .run();
}

// --- seeding -------------------------------------------------------------

// Seed the account list. The sitemap index lists every account's feed; we take
// the handles. (This is the one instance-specific step — a per-server seeder.)
async function seedFromSitemap(env) {
  const res = await fetch(`https://${SOURCE_HOST}/sitemaps.xml`, {
    headers: { 'user-agent': UA, accept: 'application/xml' },
  });
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  const xml = await res.text();

  const re = /<loc>[^<]*\/@([^/<]+)\/feed\.xml<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g;
  const rows = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    rows.push([`@${decodeURIComponent(m[1])}@${SOURCE_HOST}`, m[2]]);
  }

  const stmt = env.FEDI_DB.prepare(
    "INSERT OR IGNORE INTO kiosk_sweep (handle, state, lastmod) VALUES (?, 'pending', ?)",
  );
  for (let i = 0; i < rows.length; i += 50) {
    await env.FEDI_DB.batch(rows.slice(i, i + 50).map((r) => stmt.bind(r[0], r[1])));
  }
  return rows.length;
}

// --- ingesting -----------------------------------------------------------

// Store one Article's metadata. The body (with its contentMap) is fetched on
// demand when someone opens it, so the rack row stays small.
async function upsertPaper(env, ctx, article, handle) {
  const iri = article.id?.href;
  if (!iri) return false;
  // Title in the article's own first language, plus the list of languages it
  // carries — so the rack shows a real title and which languages it's in.
  const { title, langs, titleMap } = await articleMeta(article);
  let authorName = null;
  try {
    const a = await article.getAttribution(ctx);
    authorName = a?.name?.toString() ?? null;
  } catch {
    /* the display name is a nicety; the handle stands */
  }
  // langs/title_map are always stored (even empty) — a NULL means "gathered
  // before we captured these", which the meta backfill looks for.
  await env.FEDI_DB.prepare(
    `INSERT INTO kiosk_papers
       (iri, url, title, summary, author, author_name, published, updated, langs, title_map, fetched_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(iri) DO UPDATE SET
       url=excluded.url, title=excluded.title, summary=excluded.summary,
       author_name=excluded.author_name, published=excluded.published,
       updated=excluded.updated, langs=excluded.langs, title_map=excluded.title_map,
       fetched_at=excluded.fetched_at`,
  )
    .bind(
      iri,
      article.url?.href != null ? String(article.url.href) : iri,
      title,
      article.summary?.toString() ?? null,
      handle,
      authorName,
      article.published?.toString() ?? null,
      article.updated?.toString() ?? null,
      JSON.stringify(langs),
      JSON.stringify(titleMap),
      nowIso(),
    )
    .run();
  return true;
}

// Walk one collection page (or an inlined collection), storing any Articles, and
// report whether we've passed the horizon — seen a post older than it. The
// outbox is newest-first, so once that happens we can stop.
async function ingestPage(env, ctx, collection, handle, horizon) {
  let passed = false;
  for await (const item of collection.getItems(ctx)) {
    if (item instanceof Create) {
      let obj;
      try {
        obj = await item.getObject(ctx);
      } catch {
        obj = null;
      }
      if (obj instanceof Article) await upsertPaper(env, ctx, obj, handle);
    }
    const pub = item.published?.toString();
    if (pub && pub < horizon) passed = true; // ISO 8601 UTC — lexicographic works
  }
  return passed;
}

// --- one account, back to the horizon ------------------------------------

async function sweepToHorizon(env, ctx, row, horizon) {
  const db = env.FEDI_DB;
  let { handle, outbox_url: outboxUrl, cursor } = row;

  // First touch: resolve the actor and its outbox, take the first page URL.
  if (!outboxUrl) {
    const actor = await ctx.lookupObject(handle);
    const outbox = actor == null ? null : await actor.getOutbox(ctx);
    outboxUrl = actor?.outboxId?.href ?? null;
    cursor = outbox?.firstId?.href ?? null;
    if (!cursor) {
      if (outbox) await ingestPage(env, ctx, outbox, handle, horizon); // inlined collection
      await db.prepare("UPDATE kiosk_sweep SET state='done', outbox_url=?, cursor=NULL, swept_at=?, recent_at=? WHERE handle=?").bind(outboxUrl, nowIso(), nowIso(), handle).run();
      return;
    }
    // First touch starts at the newest end, so this is also the recent check.
    await db.prepare('UPDATE kiosk_sweep SET outbox_url=?, cursor=?, recent_at=? WHERE handle=?').bind(outboxUrl, cursor, nowIso(), handle).run();
  }

  // Walk a bounded number of pages this tick, stopping at the horizon.
  let reached = false;
  let done = false;
  for (let i = 0; i < PAGES_PER_ACCOUNT && cursor; i++) {
    const page = await ctx.lookupObject(cursor);
    if (page == null) {
      done = true;
      break;
    }
    reached = await ingestPage(env, ctx, page, handle, horizon);
    cursor = page.nextId?.href ?? null;
    if (cursor == null) done = true;
    if (reached) break;
  }

  const state = done ? 'done' : reached ? 'reached' : 'pending';
  await db.prepare('UPDATE kiosk_sweep SET cursor=?, state=?, swept_at=? WHERE handle=?').bind(cursor, state, nowIso(), handle).run();
}

// --- a tick --------------------------------------------------------------

export async function sweepTick(env, ctx) {
  const db = env.FEDI_DB;
  const { count } = await db.prepare('SELECT COUNT(*) AS count FROM kiosk_sweep').first();
  let seeded = 0;
  if (count === 0) seeded = await seedFromSitemap(env);

  // The date frontier: the backfill gathers everyone's posts back to here.
  let horizon = await getState(env, 'horizon');
  if (!horizon) {
    horizon = isoDaysAgo(STEP_DAYS);
    await setState(env, 'horizon', horizon);
  }

  // Accounts to work this window: still below the horizon (pending) AND known to
  // have posted within it (sitemap lastmod ≥ horizon). Skipping accounts that
  // posted nothing in the window is the big win — most of the instance is quiet,
  // so a window scans a handful, not all 869. Least-recently-touched first.
  // Most-recently-active first (lastmod desc) — the writers, so the rack fills
  // with real articles soonest; swept_at breaks ties so a batch round-robins.
  const pick = () =>
    db
      .prepare(
        "SELECT handle, outbox_url, cursor FROM kiosk_sweep WHERE state='pending' AND (lastmod IS NULL OR lastmod >= ?) ORDER BY lastmod DESC, swept_at ASC LIMIT ?",
      )
      .bind(horizon, ACCOUNTS_PER_TICK)
      .all()
      .then((r) => r.results);

  // When no one's active in this window, step the horizon back (waking those who
  // were waiting) until there's someone to work or the whole history is in.
  let rows = await pick();
  let advanced = null;
  let guard = 0;
  while (rows.length === 0 && guard < 120) {
    guard++;
    const left = (await db.prepare("SELECT COUNT(*) AS c FROM kiosk_sweep WHERE state != 'done'").first()).c;
    if (left === 0) break;
    horizon = isoStepBack(horizon, STEP_DAYS);
    await setState(env, 'horizon', horizon);
    await db.prepare("UPDATE kiosk_sweep SET state='pending' WHERE state='reached'").run();
    advanced = horizon;
    rows = await pick();
  }

  const fedCtx = getFederation(env).createContext(new Request('https://kiosk.atfedi.de/'), { env, ctx });
  const worked = [];
  for (const row of rows) {
    try {
      await sweepToHorizon(env, fedCtx, row, horizon);
      worked.push(row.handle);
    } catch (e) {
      // Leave the row for a later tick; one bad account mustn't stop the rest.
      worked.push(`${row.handle} (error: ${String(e).slice(0, 80)})`);
    }
  }

  const papers = (await db.prepare('SELECT COUNT(*) AS count FROM kiosk_papers').first()).count;
  return { seeded, horizon, advanced, worked, papers };
}

// Papers gathered before we captured languages have a NULL langs; re-fetch a few
// each tick and fill in their languages, per-language titles, and author name.
// Self-heals the back-catalogue gently.
export async function backfillMeta(env, ctx) {
  const { results } = await env.FEDI_DB.prepare(
    'SELECT iri FROM kiosk_papers WHERE langs IS NULL LIMIT 5',
  ).all();
  if (results.length === 0) return;

  const fedCtx = getFederation(env).createContext(new Request('https://kiosk.atfedi.de/'), { env, ctx });
  for (const { iri } of results) {
    try {
      const obj = await fedCtx.lookupObject(iri);
      if (!(obj instanceof Article)) continue;
      const { title, langs, titleMap } = await articleMeta(obj);
      let authorName = null;
      try {
        const a = await obj.getAttribution(fedCtx);
        authorName = a?.name?.toString() ?? null;
      } catch {
        /* nicety */
      }
      await env.FEDI_DB.prepare(
        'UPDATE kiosk_papers SET title=?, author_name=?, langs=?, title_map=? WHERE iri=?',
      )
        .bind(title, authorName, JSON.stringify(langs), JSON.stringify(titleMap), iri)
        .run();
    } catch {
      /* a paper that won't refetch stays NULL and is tried again next tick */
    }
  }
}

// Not-followed accounts get no push, so their new articles only surface if we
// look again. Re-check the newest end of a few whose recent_at has gone stale
// (and who've posted lately). Anything found gets them followed shortly after,
// and from then on their new articles push — so this stops mattering for them.
const FRESHEN_PER_TICK = 3;
const FRESHEN_STALE_HOURS = 12;
const FRESHEN_PAGES = 2;

export async function freshenTick(env, ctx) {
  const staleBefore = new Date(Date.now() - FRESHEN_STALE_HOURS * 3600000).toISOString();
  const activeSince = isoDaysAgo(120);
  const { results } = await env.FEDI_DB.prepare(
    `SELECT handle FROM kiosk_sweep
      WHERE handle NOT IN (SELECT handle FROM kiosk_following)
        AND (lastmod IS NULL OR lastmod >= ?)
        AND (recent_at IS NULL OR recent_at < ?)
      ORDER BY recent_at ASC LIMIT ?`,
  )
    .bind(activeSince, staleBefore, FRESHEN_PER_TICK)
    .all();
  if (results.length === 0) return;

  const fedCtx = getFederation(env).createContext(new Request('https://kiosk.atfedi.de/'), { env, ctx });
  for (const { handle } of results) {
    try {
      const actor = await fedCtx.lookupObject(handle);
      const outbox = actor == null ? null : await actor.getOutbox(fedCtx);
      let cursor = outbox?.firstId?.href ?? null;
      if (!cursor && outbox) await ingestPage(env, fedCtx, outbox, handle, '9'); // inlined
      // Newest pages only — we just take the articles on them; the horizon (and
      // ingestPage's return) is irrelevant here, so any value does.
      for (let i = 0; i < FRESHEN_PAGES && cursor; i++) {
        const page = await fedCtx.lookupObject(cursor);
        if (page == null) break;
        await ingestPage(env, fedCtx, page, handle, '9');
        cursor = page.nextId?.href ?? null;
      }
    } catch {
      /* try again next time */
    }
    await env.FEDI_DB.prepare('UPDATE kiosk_sweep SET recent_at=? WHERE handle=?').bind(nowIso(), handle).run();
  }
}
