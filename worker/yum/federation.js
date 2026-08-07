// @yum@atfedi.de — the food map's actor.
//
// A pin is placed by a gesture in two parts:
//
//   1. you post publicly about a place, the way you already would
//   2. you reply to your own post with a DM to @yum@atfedi.de, carrying the
//      place link (and, if you like, one of すき / ふつう / いまいち)
//
// The DM is the machine channel — it only ever has to say *where*. What ends up
// on the map as words is the PUBLIC post's text, which was public before yum
// saw it. The DM's own prose never reaches the map.
//
// Keeping and publishing are different promises, and it's worth saying both:
// what arrives IS kept (yum_inbox), raw, before it's read — so a link yum
// couldn't resolve yet, or a colour it read wrong, can be done again later
// instead of being lost. What's *published* is only ever the public half.
//
// Sending the DM is also the consent. There is no tag to scrape and no timeline
// to watch: yum learns about a place because someone deliberately told it. And
// the gesture is reversible — delete your DM, the Delete reaches us, the pin
// goes.
//
// Its own fedify instance, pinned to the apex origin so the handle domain and
// the actor's home match. It lives beside @kiosk@atfedi.de on the same host but
// keeps its own paths (/ap/yum/...), its own keys, and its own kv namespace.

import {
  createFederation,
  importJwk,
  exportJwk,
  generateCryptoKeyPair,
} from '@fedify/fedify';
import {
  Service,
  Endpoints,
  Note,
  Create,
  Delete,
  Mention,
  PUBLIC_COLLECTION,
} from '@fedify/fedify/vocab';
import { Temporal } from '@js-temporal/polyfill';

import { D1KvStore } from '../federation/kv.js';
import { resolvePlace, findPlaceLink, parseBareCoords } from './naver.js';

const ORIGIN = 'https://atfedi.de';
const IDENTIFIER = 'yum';
const MAP_URL = 'https://yum.atfedi.de/';

// What a curious visitor reads. This bio is also the instructions — it's the
// only place the gesture is explained to someone who arrives from elsewhere.
const BIO =
  'A shared food map — yum.atfedi.de<br><br>' +
  'Post publicly about a place, then reply to your own post with a DM to me ' +
  'carrying its Naver map link. Add すき / ふつう / いまいち for the colour. ' +
  'I put a pin there.<br><br>' +
  'No link handy? Put the place\'s name on the first line of the public post and ' +
  "I'll look it up. Bare coordinates work too.<br><br>" +
  '<b>Only your public post\'s words go on the map</b> — never the DM\'s. ' +
  'Delete the DM and the pin goes with it.<br><br>' +
  '公開でお店のことを投稿して、その投稿にNaverの地図リンクを入れたDMをぶら下げてください。' +
  '地図に出るのは公開投稿の文だけです。<br>' +
  '공개로 가게 이야기를 올리고, 그 글에 네이버 지도 링크를 담은 DM을 답글로 달아 주세요. ' +
  '지도에 나가는 건 공개 글의 문장뿐이에요.<br><br>' +
  "I'm a bot. I post nothing publicly, so following me back stays pending.";

const nowIso = () => new Date().toISOString();

// --- sharing one kv with the neighbours -----------------------------------

// Three fedify instances (blog, kiosk, yum) keep their bookkeeping in the same
// D1 `kv` table, and only one of the six key prefixes actually has to be kept
// apart:
//
//   activityIdempotence  — "already handled this activity". fedify's default
//     strategy keys it per ORIGIN, and kiosk and yum are both pinned to
//     https://atfedi.de. Shared, whichever of the two saw an activity first
//     would make the other quietly skip it. (blog is on blog.atfedi.de, so it
//     was already apart.) This one gets its own tail.
//
//   remoteDocument / publicKey / httpMessageSignaturesSpec — caches. Sharing
//   them is a *gain*: three actors talking to overlapping servers refetch less
//   and learn the double-knock once.
//   acceptSignatureNonce / circuitBreaker — sharing only makes replay
//   rejection and "that host is down" wider, which is the safe direction.
//
// So: one store, one line of separation, rather than a wall.
const KV_PREFIXES = {
  activityIdempotence: ['_fedify', 'activityIdempotence', IDENTIFIER],
};

// --- the actor's keys -----------------------------------------------------

async function ensureYumActor(env) {
  const existing = await env.FEDI_DB.prepare('SELECT * FROM yum_actor WHERE id = ?')
    .bind(IDENTIFIER)
    .first();
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
    `INSERT OR IGNORE INTO yum_actor (id, rsa_private, rsa_public, ed_private, ed_public, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(row.id, row.rsa_private, row.rsa_public, row.ed_private, row.ed_public, row.created_at)
    .run();
  return row;
}

// --- the federation instance ---------------------------------------------

let yumFederation;

export function getYumFederation(env) {
  if (yumFederation) return yumFederation;

  const federation = createFederation({
    kv: new D1KvStore(env.FEDI_DB),
    kvPrefixes: KV_PREFIXES,
    origin: ORIGIN,
  });

  federation
    .setActorDispatcher('/ap/yum/actors/{identifier}', async (ctx, identifier) => {
      if (identifier !== IDENTIFIER) return null;
      await ensureYumActor(ctx.data.env);
      const keys = await ctx.getActorKeyPairs(identifier);
      return new Service({
        id: ctx.getActorUri(identifier),
        preferredUsername: identifier,
        name: 'yum — a shared food map',
        summary: BIO,
        url: new URL(MAP_URL),
        // Locked: yum never auto-accepts a follower. It has nothing to push.
        manuallyApprovesFollowers: true,
        inbox: ctx.getInboxUri(identifier),
        outbox: ctx.getOutboxUri(identifier),
        endpoints: new Endpoints({ sharedInbox: ctx.getInboxUri() }),
        publicKey: keys[0].cryptographicKey,
        assertionMethods: keys.map((k) => k.multikey),
      });
    })
    .setKeyPairsDispatcher(async (ctx, identifier) => {
      if (identifier !== IDENTIFIER) return [];
      const row = await ensureYumActor(ctx.data.env);
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

  // Incoming activities — fedify has already verified the signature, so the
  // sender is who they say. What's left is policy, which is the whole of this.
  federation
    .setInboxListeners('/ap/yum/actors/{identifier}/inbox', '/ap/yum/inbox')
    .on(Create, onCreate)
    .on(Delete, onDelete);

  // yum publishes nothing and follows no one.
  federation.setOutboxDispatcher('/ap/yum/actors/{identifier}/outbox', async () => ({ items: [] }));
  federation.setFollowersDispatcher('/ap/yum/actors/{identifier}/followers', async () => ({ items: [] }));

  yumFederation = federation;
  return federation;
}

// --- reading the gesture --------------------------------------------------

const PUBLIC = PUBLIC_COLLECTION.href;

// Is this object addressed to the world?
function isPublic(obj) {
  const ids = [...(obj?.toIds ?? []), ...(obj?.ccIds ?? [])];
  return ids.some((u) => u.href === PUBLIC);
}

// Is this object addressed to us in particular?
function addressedToUs(obj, meHref) {
  const ids = [...(obj?.toIds ?? []), ...(obj?.ccIds ?? [])];
  return ids.some((u) => u.href === meHref);
}

// The three colours, by name only. We deliberately don't read sentiment — a
// guess at how someone felt would be worse than asking. Not saying is fine;
// the confirmation says which colour it got, and repeating the DM changes it.
const RATING_WORDS = [
  [/(いまいち|今一|イマイチ|별로|아쉬|meh)/i, 'imaichi'],
  [/(ふつう|普通|フツウ|보통|okay|\bok\b)/i, 'futsuu'],
  [/(すき|好き|スキ|좋아|좋았|\blike\b|\byum\b)/i, 'suki'],
];

function readRating(text) {
  for (const [re, rating] of RATING_WORDS) if (re.test(text)) return rating;
  return null;
}

// What the sender wrote beside the link, once the link and the colour word are
// taken out. Usually nothing — and that's fine, because of the next one.
function nameBesideLink(body) {
  let s = String(body ?? '').replace(/https?:\/\/\S+/g, ' ');
  for (const [re] of RATING_WORDS) s = s.replace(re, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

// A public post about a place almost always opens with its name, on its own
// line, before the part that is a review. Nobody has to be told to write it
// that way — it's just how it comes out. So the name is already here, next to
// us, and a Naver link never has to be prised open for it.
function openingLine(text) {
  return (String(text ?? '').split('\n')[0] || '').trim().slice(0, 60);
}

// Fediverse content is HTML. The map shows it as plain text.
function plainText(html) {
  return String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// A place name goes back out inside HTML we build, so it gets escaped — it came
// from someone else's post, or from Naver.
function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function handleOf(actor) {
  const username = actor?.preferredUsername ? String(actor.preferredUsername) : null;
  if (!username || actor.id == null) return null;
  return `@${username}@${new URL(actor.id.href).host}`;
}

// --- keeping what arrived -------------------------------------------------

// Write the DM down before reading it. Whatever happens next — a link we can't
// resolve today, a colour read wrong, a crash halfway — the thing itself is
// still here, and the pin can be derived again from it later.
async function recordIncoming(env, create, note, sender) {
  let raw = null;
  try {
    raw = JSON.stringify(await create.toJsonLd({ format: 'compact' }));
  } catch {
    /* if it won't serialise we still want the row — the ids alone say it came */
  }
  await env.FEDI_DB.prepare(
    `INSERT INTO yum_inbox (dm_iri, actor_iri, by_handle, post_iri, raw, outcome, received_at)
     VALUES (?, ?, ?, ?, ?, 'received', ?)
     ON CONFLICT(dm_iri) DO UPDATE SET
       raw=excluded.raw, post_iri=excluded.post_iri`,
    // received_at deliberately not touched: a replay is us reading it again,
    // not it arriving again, and when it arrived is part of what was kept.
  )
    .bind(
      note.id.href,
      sender.id.href,
      handleOf(sender),
      note.replyTargetId?.href ?? null,
      raw,
      nowIso(),
    )
    .run();
}

async function settle(env, dmIri, outcome) {
  await env.FEDI_DB.prepare('UPDATE yum_inbox SET outcome = ?, settled_at = ? WHERE dm_iri = ?')
    .bind(outcome, nowIso(), dmIri)
    .run();
}

// --- placing a pin --------------------------------------------------------

async function onCreate(ctx, create) {
  const env = ctx.data.env;
  const note = await create.getObject(ctx).catch(() => null);
  if (!(note instanceof Note) || note.id == null) return;

  const me = ctx.getActorUri(IDENTIFIER).href;

  // It has to be a DM to us. A public mention isn't the machine channel — we
  // stay quiet rather than answering in the open. (And we don't keep what
  // wasn't addressed to us.)
  if (isPublic(note) || isPublic(create)) return;
  if (!addressedToUs(note, me) && !addressedToUs(create, me)) return;

  const sender = await create.getActor(ctx).catch(() => null);
  if (sender?.id == null) return;

  await recordIncoming(env, create, note, sender);
  const dmIri = note.id.href;

  // A refusal is a resting place, not a bin: the row keeps the raw DM with the
  // reason, so improving the reading and retrying is possible.
  const refuse = async (reason, lines) => {
    await settle(env, dmIri, reason);
    await say(ctx, sender, note, lines);
  };

  const body = plainText(note.content?.toString() ?? '');

  // It has to hang off a post.
  const parentId = note.replyTargetId;
  if (parentId == null) {
    return refuse('no-parent', [
      '먼저 가게 이야기를 공개로 올리고, 그 글에 답글로 이 DM을 달아 주세요.',
      'まず公開でお店のことを投稿して、その投稿にぶら下げる形でDMを送ってください。',
    ]);
  }

  // Why this failed matters — it decides a refusal, and a swallowed reason is
  // exactly what makes the same refusal unexplainable later.
  const parent = await ctx.lookupObject(parentId).catch((e) => {
    console.error('yum: parent lookup threw', parentId?.href, String(e?.stack ?? e).slice(0, 500));
    return null;
  });
  if (parent?.id == null) {
    console.error('yum: parent unreadable', parentId?.href, 'got', parent?.constructor?.name ?? 'null');
    // Their server may just be slow or briefly down — this one is worth
    // retrying later, and the kept row is what makes that possible.
    return refuse('parent-unreadable', [
      '그 글을 읽지 못했어요. 잠시 뒤에 다시 보내 주실래요?',
      'その投稿が読めませんでした。少し経ってから、もう一度送ってもらえますか。',
    ]);
  }

  // It has to be *your own* post. Otherwise anyone could put anyone on the map.
  if (parent.attributionId?.href !== sender.id.href) {
    return refuse('not-own-post', [
      '자기 글에만 놓을 수 있어요. 남의 글은 대신 올릴 수 없어요.',
      '地図に置けるのは自分の投稿だけです。ほかの人の投稿は代わりに置けません。',
    ]);
  }

  // And it has to actually be public — a followers-only post would leak
  // through the map, which is open to everyone.
  if (!isPublic(parent)) {
    return refuse('parent-not-public', [
      '그 글이 공개가 아니에요. 지도는 누구나 볼 수 있어서, 공개 글만 놓을 수 있어요.',
      'その投稿が公開ではないようです。地図は誰でも見られるので、公開の投稿だけ置けます。',
    ]);
  }

  // The words on the map come from the public post. The DM's own prose is read
  // for a link, a colour and maybe a name, and goes no further than yum_inbox —
  // kept, so a wrong reading can be redone; never rendered.
  const note_text = plainText(parent.content?.toString() ?? '').slice(0, 280);

  // Where. A coordinate the sender typed is taken as given. Otherwise the link
  // is opened by its place id, and failing that the place is found by NAME —
  // from the DM if they wrote one, else from the public post's opening line,
  // which is where a name usually already is. (See naver.js for what each of
  // those routes costs and why.)
  const link = findPlaceLink(body);
  const bare = parseBareCoords(body);
  const hints = [nameBesideLink(body), openingLine(note_text)];
  const place = bare
    ? { ...bare, name: hints.find(Boolean) ?? null, url: link }
    : await resolvePlace(link, hints, env);

  if (!place) {
    // Worth keeping: if the search key improves, or credentials arrive, these
    // are the rows to run again.
    return refuse('place-unresolved', [
      '어디인지 못 찾았어요. 네이버 지도 링크를 보내 주시거나, 공개 글 첫 줄에 가게 이름만 적어 주세요. ' +
        '(정 안 되면 "35.0923,129.0453" 처럼 좌표도 괜찮아요.)',
      '場所が見つけられませんでした。Naverの地図リンクを送ってもらうか、公開した投稿の一行目にお店の名前だけ書いてもらえると探せます。' +
        '（どうしても駄目なときは「35.0923,129.0453」のように座標でも大丈夫です。）',
    ]);
  }

  const rating = readRating(body) ?? 'suki';
  const name = place.name || openingLine(note_text).slice(0, 24) || null;

  const stamp = nowIso();
  await env.FEDI_DB.prepare(
    `INSERT INTO yum_pins
       (post_iri, post_url, dm_iri, by_handle, lat, lng, name, rating, note, place_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(post_iri) DO UPDATE SET
       post_url=excluded.post_url, dm_iri=excluded.dm_iri, lat=excluded.lat, lng=excluded.lng,
       name=excluded.name, rating=excluded.rating, note=excluded.note,
       place_url=excluded.place_url, updated_at=excluded.updated_at`,
  )
    .bind(
      parent.id.href,
      parent.url?.href != null ? String(parent.url.href) : parent.id.href,
      note.id.href,
      handleOf(sender),
      place.lat,
      place.lng,
      name || null,
      rating,
      note_text || null,
      place.url ?? link ?? null,
      stamp,
      stamp,
    )
    .run();

  await settle(env, dmIri, 'placed');

  const colour = { suki: 'すき / 좋아', futsuu: 'ふつう / 보통', imaichi: 'いまいち / 별로' }[rating];
  // Say back WHICH place was found, not just that one was. The name is looked
  // up by search, so it can come back worded differently than it was written —
  // showing it is how a wrong match becomes visible instead of quietly standing.
  await say(ctx, sender, note, [
    `지도에 놓았어요 — 「${esc(name ?? '이름 없음')}」 · ${colour} · ${MAP_URL}`,
    `「${esc(name ?? '名前なし')}」として置きました。ちがう場所だったら、公開の投稿の一行目をお店の名前だけにして、もう一度DMをください。`,
    `色は「${colour}」です。ちがったら「ふつう」「いまいち」と書き添えて、同じようにもう一度。`,
    'DMを消すと、ピンも消えます。 / DM을 지우면 핀도 사라져요.',
  ]);
}

// Their DM is gone → the pin goes. The gesture stays reversible from their side,
// with no command to remember.
//
// Keeping what arrives has one limit, and this is it: a Delete means *forget
// this*. So the kept copy is cleared rather than held on to. What stays is the
// bare fact that something came and was withdrawn — enough to explain a missing
// pin, without keeping the thing they took back.
async function onDelete(ctx, del) {
  const objectId = del.objectId?.href;
  if (!objectId) return;
  const env = ctx.data.env;

  // Only the sender can withdraw their own DM.
  const row = await env.FEDI_DB.prepare('SELECT actor_iri FROM yum_inbox WHERE dm_iri = ?')
    .bind(objectId)
    .first();
  if (row && row.actor_iri && row.actor_iri !== del.actorId?.href) return;

  await env.FEDI_DB.prepare('DELETE FROM yum_pins WHERE dm_iri = ?').bind(objectId).run();
  await env.FEDI_DB.prepare(
    "UPDATE yum_inbox SET raw = NULL, outcome = 'deleted', settled_at = ? WHERE dm_iri = ?",
  )
    .bind(nowIso(), objectId)
    .run();
}

// --- reading the kept ones again ------------------------------------------

// The point of keeping what arrives: when the reading gets better, the DMs it
// couldn't read before are still here to read again.
//
// A row is replayed by handing its stored activity back to `onCreate` — the
// same door a fresh delivery comes through — so there is one placement path,
// not a second one that drifts. Everything downstream is already idempotent
// (the pin upserts on the public post) so a replay is safe to repeat.
//
// Only refusals that a better day could fix are retried; 'not-own-post' and
// 'parent-not-public' are answers, not failures, and are left alone.
const RETRYABLE = ['place-unresolved', 'parent-unreadable'];
const MAX_TRIES = 5;
const PER_TICK = 2;

export async function backfillTick(env, ctx) {
  // Leave a fresh failure alone for a while — the point is a later, better try.
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { results } = await env.FEDI_DB.prepare(
    `SELECT dm_iri, raw FROM yum_inbox
      WHERE outcome IN (${RETRYABLE.map(() => '?').join(',')})
        AND raw IS NOT NULL
        AND tries < ?
        AND (settled_at IS NULL OR settled_at < ?)
      ORDER BY received_at
      LIMIT ?`,
  )
    .bind(...RETRYABLE, MAX_TRIES, cutoff, PER_TICK)
    .all();
  if (!results?.length) return { replayed: 0 };

  const fedCtx = getYumFederation(env).createContext(new Request(`${ORIGIN}/`), { env, ctx });
  let replayed = 0;

  for (const row of results) {
    // Count the try before making it, so a row that throws every time still
    // runs out of tries instead of coming back forever.
    await env.FEDI_DB.prepare('UPDATE yum_inbox SET tries = tries + 1 WHERE dm_iri = ?')
      .bind(row.dm_iri)
      .run();
    try {
      const create = await Create.fromJsonLd(JSON.parse(row.raw), {
        documentLoader: fedCtx.documentLoader,
        contextLoader: fedCtx.contextLoader,
      });
      await onCreate(fedCtx, create);
      replayed++;
    } catch {
      /* left for the next tick, or for its tries to run out */
    }
  }
  return { replayed };
}

// --- saying something back ------------------------------------------------

// Every answer is a DM, threaded under what they sent. yum says nothing in the
// open, so a refusal is never a public correction of anybody.
async function say(ctx, recipient, inReplyTo, lines) {
  const handle = handleOf(recipient);
  const content = lines.map((l) => `<p>${l}</p>`).join('');
  const stamp = Date.now();

  await ctx
    .sendActivity(
      { identifier: IDENTIFIER },
      recipient,
      new Create({
        id: new URL(`#say/${stamp}`, ctx.getActorUri(IDENTIFIER)),
        actor: ctx.getActorUri(IDENTIFIER),
        tos: [recipient.id],
        object: new Note({
          id: new URL(`#note/${stamp}`, ctx.getActorUri(IDENTIFIER)),
          attribution: ctx.getActorUri(IDENTIFIER),
          replyTarget: inReplyTo?.id ?? undefined,
          content,
          published: Temporal.Now.instant(),
          tos: [recipient.id],
          tags: handle ? [new Mention({ href: recipient.id, name: handle })] : [],
        }),
      }),
    )
    .catch(() => {
      /* a reply is a kindness, not the job — a failed one doesn't undo the pin */
    });
}

// What the apex Worker hands @yum's ActivityPub traffic to.
export function handleYumFederation(request, env, ctx) {
  return getYumFederation(env).fetch(request, { contextData: { env, ctx } });
}
