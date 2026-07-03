## The roadmap

Federation isn't one feature — it grows in stages, and each stage is
independently verifiable. Here is the whole climb, seen from up high: six
stages, each with what fedify carries, what you write, and a checkpoint you
can actually run. The first three stages are thin; stage four is where your
real application work lives.

### 1. [icon:search] Be findable

One `createFederation(...)` call wired into your web framework, an actor
dispatcher returning a `Person` from your user table, a key-pairs dispatcher
returning stored JWKs.

- **Fedify carries** — WebFinger, content negotiation, the actor JSON-LD
  (`@context`, `publicKey`, `assertionMethod`), NodeInfo routing, key
  generation for both RSA and Ed25519.
- **You write** — a database lookup, and somewhere to keep two JWKs per user.
- **Checkpoint** — search `@you@your.domain` from Mastodon and your profile
  appears. `fedify lookup @you@your.domain` shows your actor.
- Docs: [tutorial/basics](https://fedify.dev/tutorial/basics) ·
  [manual/actor](https://fedify.dev/manual/actor)

### 2. [icon:user-plus] Be followable

Inbox listeners — your first `.on(Follow, …)`.

- **Fedify carries** — signature verification before your handler runs,
  typed dispatch, signing and delivering your `Accept`.
- **You write** — persist the follower, send the `Accept`, and the policy
  call: auto-accept or hold for approval
  (`manuallyApprovesFollowers` is only a label — the decision is your code).
- **Checkpoint** — follow yourself from a Mastodon account; it flips from
  "requested" to "following", and your followers collection counts one.
- Docs: [manual/inbox](https://fedify.dev/manual/inbox) ·
  [manual/collections](https://fedify.dev/manual/collections)

### 3. [icon:megaphone] Speak

Your first outbound `Create(Note)`.

- **Fedify carries** — fan-out to every follower in one `sendActivity`
  call, shared-inbox dedup, retries with backoff, delivery ordering
  (`orderingKey`), the outbox collection envelope.
- **You write** — the post model, its HTML, mentions and hashtags as `tag`s.
- **Checkpoint** — you post, and it lands on your follower's Mastodon
  timeline. `fedify inbox` gives you a throwaway follower to send at while
  you iterate.
- Docs: [manual/send](https://fedify.dev/manual/send) ·
  [tutorial/microblog](https://fedify.dev/tutorial/microblog)

### 4. [icon:ear] Listen — the big one

Receiving `Create` from the network and mirroring it: remote actors and
posts as rows in your database, timelines, notifications.

- **Fedify carries** — typed objects out of any JSON shape, document
  loaders, cross-origin verification of embedded objects.
- **You write** — the mirror: `persistActor`, `persistPost`, reply
  threading, timeline fan-in, notifications. This is deliberately not
  fedify's job, and it is the single largest bucket of federation code in
  every app we read. Budget most of your time here.
- **Checkpoint** — a Mastodon reply to your post appears in your app,
  threaded under the right post, and notifies the right user.
- Docs: [manual/vocab](https://fedify.dev/manual/vocab) — and read
  `persistPost` in [Hackers' Pub](https://github.com/hackers-pub/hackerspub)
  before designing yours.

### 5. [icon:repeat] Interact

The conversational verbs, in both directions: `Like`, `Announce`, `Update`,
`Delete`, `Undo`.

- **Fedify carries** — all the vocabulary and the delivery; idempotency
  cache on the receiving side.
- **You write** — state transitions with upsert-safe writes, undoing
  (`Undo(Like)` really removes the like), deletes with judgment — a `Delete(Actor)`
  that erases moderation evidence is a decision, not a default.
- **Checkpoint** — like and boost round-trip both ways; edit a post and the
  `Update` shows on Mastodon; delete it and it's gone there too.
- Docs: [manual/pragmatics](https://fedify.dev/manual/pragmatics) — how each
  verb actually renders on Mastodon.

### 6. [icon:server] Grow up

From "it federates" to "it runs".

- **Fedify carries** — pluggable message queues, retry policy, circuit
  breakers, permanent-failure reporting, authorized fetch and the instance
  actor, OpenTelemetry tracing.
- **You write** — the worker-process split (`manuallyStartQueue` +
  `startQueue`), failure cleanup (prune on 404, cascade on `410 Gone`),
  moderation and block checks, monitoring dashboards.
- **Checkpoint** — the
  [pre-launch checklist](https://fedify.dev/manual/deploy) in manual/deploy,
  top to bottom.
- Docs: [manual/mq](https://fedify.dev/manual/mq) ·
  [manual/access-control](https://fedify.dev/manual/access-control) ·
  [manual/opentelemetry](https://fedify.dev/manual/opentelemetry)

## [icon:telescope] The panorama — how far the road goes

Everything above is a microblog. The same six stages, with fedify's
vocabulary and the ecosystem knowledge already in the box, extend to:

- [icon:notebook-pen] **Long-form writing** — `Article` with multi-language
  content and markdown `Source`; Hackers' Pub federates full blog posts.
- [icon:braces] **Polls** — `Question`, votes as replies, `Update` when they
  close.
- [icon:heart-handshake] **Emoji reactions** — `EmojiReact` and custom
  `Emoji`, the Misskey lineage; Hollo speaks both.
- [icon:map] **Quote posts** — FEP-044f `QuoteRequest` / `QuoteAuthorization`
  with interaction policies — still the frontier; see
  [Keep in mind](/build/fedify/watch-out).
- [icon:footprints] **Account migration** — `Move`, follower forwarding,
  aliases; both reference codebases handle it.
- [icon:gavel] **Reports** — `Flag` across servers, with Mastodon's
  expectations encoded.
- [icon:send] **Relays** — subscribe and serve; `fedify relay` in the
  [CLI](https://fedify.dev/cli) and [manual/relay](https://fedify.dev/manual/relay).
- [icon:split] **Any runtime shape** — Deno, Node, Bun; a dozen web
  frameworks; KV and queue adapters down to serverless.

And the honest edge of the view: persistence, timelines, notifications,
media storage, client apps and their APIs are never fedify's — that's your
application. The line is drawn precisely in
[what stays yours](/build/fedify/watch-out).

## [icon:book-open] FEPs along the way

FEPs — [Fediverse Enhancement Proposals](https://w3id.org/fep/) — are the
fediverse's shared notes on how things are actually done, one step less
formal than a spec. Fedify implements a good stack of them; its
[FEDERATION.md](https://github.com/fedify-dev/fedify/blob/main/FEDERATION.md)
is the authoritative list. The ones you'll actually meet on this road:

- **Stage 1, be findable** — [FEP-521a](https://w3id.org/fep/521a) (how an
  actor publishes its public keys) and
  [FEP-8b32](https://w3id.org/fep/8b32) (Object Integrity Proofs — the
  Ed25519 document signatures) are why fedify has you keep two key pairs.
  [FEP-f1d5](https://w3id.org/fep/f1d5) is NodeInfo.
- **Stage 2, be followable** — [FEP-8fcf](https://w3id.org/fep/8fcf) keeps
  follower collections in sync across servers;
  [FEP-5feb](https://w3id.org/fep/5feb) is the search-indexing consent flag
  respectful servers check before indexing your users.
- **Stage 4, listen** — [FEP-fe34](https://w3id.org/fep/fe34) is the
  origin-based security model behind the cross-origin re-fetch default you
  met in [Keep in mind](/build/fedify/watch-out).
- **The panorama** — emoji reactions are
  [FEP-c0e0](https://w3id.org/fep/c0e0); quote posts are
  [FEP-e232](https://w3id.org/fep/e232) (object links) plus
  [FEP-044f](https://w3id.org/fep/044f) (consent-respecting quotes); relays
  speak [FEP-ae0c](https://w3id.org/fep/ae0c); account export rides
  [FEP-9091](https://w3id.org/fep/9091).
- **And one for you** — [FEP-67ff](https://w3id.org/fep/67ff) simply says:
  document your federation behavior in a `FEDERATION.md`. Fedify keeps one;
  when your server grows up, keep one too.

---

[icon:arrow-left] [Back to Fedify](/build/fedify) ·
[icon:arrow-right] [Keep in mind](/build/fedify/watch-out)
