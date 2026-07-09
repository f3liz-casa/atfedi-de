// blog.atfedi.de — the federation layer.
//
// A plain fetch handler that the dispatcher Worker hands the ActivityPub
// traffic to: the actor documents, WebFinger, the inbox, the outbox. Built on
// fedify, which verifies signatures and speaks the vocabulary; the remembering
// is ours (see store.js) and lives in D1.
//
// This file is the actor and its keys. The inbox handlers (follows, comments)
// and the outbox (publishing Articles) arrive in their own steps — their URIs
// resolve here so the actor is already well-formed.

import {
  createFederation,
  importJwk,
  exportJwk,
  generateCryptoKeyPair,
} from '@fedify/fedify';
import {
  Person,
  Endpoints,
  Article,
  Follow,
  Undo,
  Create,
  Update,
  Delete,
} from '@fedify/fedify/vocab';

import { D1KvStore } from './kv.js';
import { getActor, putActor, listFollowers, listOutbox } from './store.js';
import { onFollow, onUndo, onCreate, onDelete } from './inbox.js';
import { getWriter, getTranslations } from './content.js';
import { buildArticle } from './article.js';

// The writers we host come from the blog's own author collection, carried to
// the Worker in the build-time manifest (content.js) — one source of truth, no
// second list to drift.

// Built once per isolate. fedify's KvStore is backed by the same D1 as
// everything else (see kv.js) — one store, not two.
let federation;

export function getFederation(env) {
  if (federation) return federation;

  federation = createFederation({
    kv: new D1KvStore(env.FEDI_DB),
    // Pin the public origin: fedify verifies HTTP signatures against it, and
    // Cloudflare rewrites the inbound Host — without this the check would run
    // against the wrong one. (atfedi's fedify guide, "running".)
    origin: 'https://blog.atfedi.de',
    // No message queue: a blog delivers to few, rarely. Without one, fedify
    // sends inline. Swap in WorkersMessageQueue if that fan-out ever grows.
  });

  federation
    .setActorDispatcher('/ap/actors/{identifier}', async (ctx, identifier) => {
      const row = await ensureActor(ctx.data.env, identifier);
      if (!row) return null;

      const keys = await ctx.getActorKeyPairs(identifier);
      return new Person({
        id: ctx.getActorUri(identifier),
        preferredUsername: identifier,
        name: row.name,
        summary: row.summary ?? undefined,
        // The human profile page — carries a rel=alternate back to this actor,
        // so the round-trip closes (actor → url → page → actor). English is the
        // default face; the page exists in every locale with en as fallback.
        url: new URL(`https://blog.atfedi.de/en/by/${identifier}/`),
        inbox: ctx.getInboxUri(identifier),
        outbox: ctx.getOutboxUri(identifier),
        followers: ctx.getFollowersUri(identifier),
        endpoints: new Endpoints({ sharedInbox: ctx.getInboxUri() }),
        publicKey: keys[0].cryptographicKey, // RSA — what Mastodon checks
        assertionMethods: keys.map((k) => k.multikey), // Ed25519 lives here
      });
    })
    .setKeyPairsDispatcher(async (ctx, identifier) => {
      const row = await ensureActor(ctx.data.env, identifier);
      if (!row) return [];
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

  // Incoming activities. fedify has already verified the signature before any
  // of these run.
  federation
    .setInboxListeners('/ap/actors/{identifier}/inbox', '/ap/inbox')
    .on(Follow, onFollow)
    .on(Undo, onUndo)
    .on(Create, onCreate)
    .on(Delete, onDelete);

  // The followers collection, and the recipient list delivery reads from.
  federation.setFollowersDispatcher(
    '/ap/actors/{identifier}/followers',
    async (ctx, identifier) => {
      const rows = await listFollowers(ctx.data.env.FEDI_DB, identifier);
      return {
        items: rows.map((r) => ({
          id: new URL(r.follower_uri),
          inboxId: new URL(r.inbox_url),
          endpoints: r.shared_inbox
            ? new Endpoints({ sharedInbox: new URL(r.shared_inbox) })
            : null,
        })),
      };
    },
  );

  // A published post, derived from the manifest. Makes each Article id
  // dereferenceable — for threading, replies, and servers that verify.
  federation.setObjectDispatcher(
    Article,
    '/ap/actors/{identifier}/articles/{slug}',
    async (ctx, { identifier, slug }) => {
      if (!(await ensureActor(ctx.data.env, identifier))) return null; // a writer?
      const translations = await getTranslations(ctx.data.env, identifier, slug);
      return translations.length ? buildArticle(ctx, identifier, slug, translations) : null;
    },
  );

  // What we've published, from D1. The activities reference their Articles by
  // URI (dereferenceable via the object dispatcher above).
  federation.setOutboxDispatcher(
    '/ap/actors/{identifier}/outbox',
    async (ctx, identifier) => {
      const rows = await listOutbox(ctx.data.env.FEDI_DB, identifier);
      return {
        items: rows.map((r) => {
          const props = {
            id: new URL(r.activity_id),
            actor: ctx.getActorUri(identifier),
            object: new URL(r.object_id),
          };
          return r.type === 'Update' ? new Update(props) : new Create(props);
        }),
      };
    },
  );

  return federation;
}

// Return the actor row for a hosted writer, minting keys on first sight.
// Unknown handles return null (we don't host them).
async function ensureActor(env, handle) {
  const existing = await getActor(env.FEDI_DB, handle);
  if (existing) return existing;

  const writer = await getWriter(env, handle);
  if (!writer) return null;

  const rsa = await generateCryptoKeyPair('RSASSA-PKCS1-v1_5');
  const ed = await generateCryptoKeyPair('Ed25519');
  const row = {
    handle,
    name: writer.name,
    summary: null,
    rsa_private: JSON.stringify(await exportJwk(rsa.privateKey)),
    rsa_public: JSON.stringify(await exportJwk(rsa.publicKey)),
    ed_private: JSON.stringify(await exportJwk(ed.privateKey)),
    ed_public: JSON.stringify(await exportJwk(ed.publicKey)),
    created_at: new Date().toISOString(),
  };
  await putActor(env.FEDI_DB, row);
  return row;
}

// What the dispatcher Worker calls. The env (D1, KV) and ctx (waitUntil) ride
// along as context data, so the dispatchers can reach them.
export function handleFederation(request, env, ctx) {
  return getFederation(env).fetch(request, { contextData: { env, ctx } });
}
