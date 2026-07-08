// @kiosk@atfedi.de — the newsstand's actor.
//
// kiosk gathers Articles two ways: it walks outboxes for the back-catalogue
// (sweep.js), and — the honest way for what's new — it *follows* writers, so
// their new Articles arrive here as Create activities in this inbox. No polling
// for freshness.
//
// It is a bot that only reads. It posts nothing, and it doesn't accept being
// followed back (manuallyApprovesFollowers, and no Follow handler — requests
// simply rest, and the bio says why). Its own fedify instance, pinned to the
// apex origin, so the handle domain and the actor's home match.

import {
  createFederation,
  importJwk,
  exportJwk,
  generateCryptoKeyPair,
} from '@fedify/fedify';
import {
  Service,
  Endpoints,
  Follow,
  Accept,
  Reject,
  Create,
  Announce,
  Article,
} from '@fedify/fedify/vocab';

import { D1KvStore } from '../federation/kv.js';
import { articleMeta } from '../federation/read.js';
import { SOURCE_HOST } from './sweep.js';

const ORIGIN = 'https://atfedi.de';
const IDENTIFIER = 'kiosk';

// The bio a curious follower reads. Honest about what kiosk is and isn't.
const BIO =
  'A read-only newsstand for the fediverse. I follow writers to gather their ' +
  'articles onto a rack at kiosk.atfedi.de — I post nothing myself. ' +
  "I'm a bot, not the official atfedi account (a proper one is planned), so " +
  'following me back stays pending. The rack is open to everyone to read.';

const nowIso = () => new Date().toISOString();

// --- the actor's keys ----------------------------------------------------

async function ensureKioskActor(env) {
  const existing = await env.FEDI_DB.prepare('SELECT * FROM kiosk_actor WHERE id = ?').bind(IDENTIFIER).first();
  if (existing) return existing;

  const rsa = await generateCryptoKeyPair('RSASSA-PKCS1-v1_5');
  const ed = await generateCryptoKeyPair('Ed25519');
  const row = {
    id: IDENTIFIER,
    rsa_private: JSON.stringify(await exportJwk(rsa.privateKey)),
    rsa_public: JSON.stringify(await exportJwk(rsa.publicKey)),
    ed_private: JSON.stringify(await exportJwk(ed.privateKey)),
    ed_public: JSON.stringify(await exportJwk(ed.publicKey)),
    created_at: nowIso(),
  };
  await env.FEDI_DB.prepare(
    `INSERT OR IGNORE INTO kiosk_actor (id, rsa_private, rsa_public, ed_private, ed_public, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(row.id, row.rsa_private, row.rsa_public, row.ed_private, row.ed_public, row.created_at)
    .run();
  return row;
}

// --- the federation instance ---------------------------------------------

let kioskFederation;

export function getKioskFederation(env) {
  if (kioskFederation) return kioskFederation;

  const federation = createFederation({
    kv: new D1KvStore(env.FEDI_DB),
    origin: ORIGIN,
  });

  federation
    .setActorDispatcher('/ap/actors/{identifier}', async (ctx, identifier) => {
      if (identifier !== IDENTIFIER) return null;
      await ensureKioskActor(ctx.data.env);
      const keys = await ctx.getActorKeyPairs(identifier);
      return new Service({
        id: ctx.getActorUri(identifier),
        preferredUsername: identifier,
        name: 'kiosk — a fediverse newsstand',
        summary: BIO,
        url: new URL('https://kiosk.atfedi.de/'),
        // A locked account: kiosk never auto-accepts a follower (see below).
        manuallyApprovesFollowers: true,
        inbox: ctx.getInboxUri(identifier),
        outbox: ctx.getOutboxUri(identifier),
        following: ctx.getFollowingUri(identifier),
        endpoints: new Endpoints({ sharedInbox: ctx.getInboxUri() }),
        publicKey: keys[0].cryptographicKey,
        assertionMethods: keys.map((k) => k.multikey),
      });
    })
    .setKeyPairsDispatcher(async (ctx, identifier) => {
      if (identifier !== IDENTIFIER) return [];
      const row = await ensureKioskActor(ctx.data.env);
      return [
        {
          privateKey: await importJwk(JSON.parse(row.rsa_private), 'private'),
          publicKey: await importJwk(JSON.parse(row.rsa_public), 'public'),
        },
        {
          privateKey: await importJwk(JSON.parse(row.ed_private), 'private'),
          publicKey: await importJwk(JSON.parse(row.ed_public), 'public'),
        },
      ];
    });

  // Incoming activities (signatures already verified by fedify).
  //
  // Note there is deliberately NO Follow handler: someone following @kiosk is
  // left pending (the account is locked), and the bio explains. What we do care
  // about is new Articles from the writers we follow, and the Accept/Reject to
  // our own Follows.
  federation
    .setInboxListeners('/ap/actors/{identifier}/inbox', '/ap/inbox')
    .on(Create, onCreate)
    .on(Announce, onAnnounce)
    .on(Accept, onAccept)
    .on(Reject, onReject);

  // kiosk follows people; expose that as its following collection. (Its
  // followers collection stays empty — it doesn't accept any.)
  federation.setFollowingDispatcher('/ap/actors/{identifier}/following', async (ctx, identifier) => {
    if (identifier !== IDENTIFIER) return null;
    const { results } = await ctx.data.env.FEDI_DB.prepare(
      "SELECT target_iri FROM kiosk_following WHERE state='accepted' ORDER BY created_at DESC",
    ).all();
    return { items: results.map((r) => new URL(r.target_iri)) };
  });
  federation.setFollowersDispatcher('/ap/actors/{identifier}/followers', async () => ({ items: [] }));

  // An empty outbox — kiosk publishes nothing.
  federation.setOutboxDispatcher('/ap/actors/{identifier}/outbox', async () => ({ items: [] }));

  kioskFederation = federation;
  return federation;
}

// --- inbox handlers ------------------------------------------------------

// A new Article pushed by someone we follow → onto the rack.
async function onCreate(ctx, create) {
  const obj = await create.getObject(ctx).catch(() => null);
  if (obj instanceof Article) await upsertArticle(ctx.data.env, obj);
}

// A boost of an Article → gather it too (it's still a public Article we can read).
async function onAnnounce(ctx, announce) {
  const obj = await announce.getObject(ctx).catch(() => null);
  if (obj instanceof Article) await upsertArticle(ctx.data.env, obj);
}

// Our Follow was accepted — the writer now delivers to us.
async function onAccept(ctx, accept) {
  if (accept.actorId == null) return;
  await ctx.data.env.FEDI_DB.prepare(
    "UPDATE kiosk_following SET state='accepted' WHERE target_iri=?",
  )
    .bind(accept.actorId.href)
    .run();
}

async function onReject(ctx, reject) {
  if (reject.actorId == null) return;
  await ctx.data.env.FEDI_DB.prepare(
    "UPDATE kiosk_following SET state='rejected' WHERE target_iri=?",
  )
    .bind(reject.actorId.href)
    .run();
}

// Store an Article delivered to the inbox. Same shape as the sweep's rack row.
async function upsertArticle(env, article) {
  const iri = article.id?.href;
  if (!iri) return;
  let author = null;
  let authorName = null;
  try {
    const a = await article.getAttribution();
    const username = a?.preferredUsername ? String(a.preferredUsername) : null;
    if (username && a.id) author = `@${username}@${new URL(a.id.href).host}`;
    authorName = a?.name?.toString() ?? null;
  } catch {
    /* author is a nicety */
  }
  const { title, langs, titleMap } = await articleMeta(article);
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
      author,
      authorName,
      article.published?.toString() ?? null,
      article.updated?.toString() ?? null,
      JSON.stringify(langs),
      JSON.stringify(titleMap),
      nowIso(),
    )
    .run();
}

// --- following out -------------------------------------------------------

// Send a Follow from @kiosk to one writer, and remember it (pending until they
// Accept). Idempotent per target.
async function followOne(env, ctx, handle) {
  const existing = await env.FEDI_DB.prepare('SELECT target_iri FROM kiosk_following WHERE handle=?').bind(handle).first();
  if (existing) return false;

  const target = await ctx.lookupObject(handle);
  if (target?.id == null || target.inboxId == null) return false;

  const followId = new URL(`#follow/${Date.now()}`, ctx.getActorUri(IDENTIFIER));
  await ctx.sendActivity(
    { identifier: IDENTIFIER },
    target,
    new Follow({ id: followId, actor: ctx.getActorUri(IDENTIFIER), object: target.id }),
  );
  await env.FEDI_DB.prepare(
    "INSERT OR IGNORE INTO kiosk_following (target_iri, handle, state, follow_id, created_at) VALUES (?, ?, 'pending', ?, ?)",
  )
    .bind(target.id.href, handle, followId.href, nowIso())
    .run();
  return true;
}

// A gentle tick: follow a few writers we've gathered Articles from but aren't
// following yet. (Follow scope: only people who actually write Articles.)
const FOLLOWS_PER_TICK = 3;

export async function followTick(env, ctx) {
  const { results } = await env.FEDI_DB.prepare(
    `SELECT DISTINCT author FROM kiosk_papers
      WHERE author IS NOT NULL
        AND author NOT IN (SELECT handle FROM kiosk_following)
      LIMIT ?`,
  )
    .bind(FOLLOWS_PER_TICK)
    .all();
  if (results.length === 0) return { followed: [] };

  const fedCtx = getKioskFederation(env).createContext(new Request(`${ORIGIN}/`), { env, ctx });
  const followed = [];
  for (const row of results) {
    try {
      if (await followOne(env, fedCtx, row.author)) followed.push(row.author);
    } catch (e) {
      followed.push(`${row.author} (error: ${String(e).slice(0, 80)})`);
    }
  }
  return { followed };
}

// What the apex Worker hands the kiosk actor's ActivityPub traffic to.
export function handleKioskFederation(request, env, ctx) {
  return getKioskFederation(env).fetch(request, { contextData: { env, ctx } });
}
