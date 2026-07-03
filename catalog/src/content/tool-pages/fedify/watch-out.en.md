## Keep in mind

Two lists: the work fedify deliberately leaves to you, and the sharp edges
we found — each with where it's written down.

## What stays yours — by design

Fedify is the protocol layer, not the application. Read Hollo and
Hackers' Pub side by side, and they agree precisely on where the app's real
work goes:

**Persistence.** Fedify hands you vocab objects and stores nothing.
Mirroring remote actors and posts into your own database is the single
largest bucket of federation code in Hackers' Pub (`persistActor`,
`persistPost` — thousands of lines of careful upserts). Budget for it from
day one.

**Policy.** `manuallyApprovesFollowers` only flips the lock icon; whether to
auto-`Accept` a Follow is your inbox handler's decision
([manual/pragmatics](https://fedify.dev/manual/pragmatics)). Moderation too:
check your own block lists *before* dereferencing a remote actor. And think
before honoring a `Delete(Actor)` — Hackers' Pub deliberately keeps
sanctioned actors around, so a remote actor can't erase moderation evidence
just by deleting itself.

**Side effects.** Notifications, timelines, counters — all app-side fan-out
inside your handlers. Fedify has an inbound idempotency cache
([manual/inbox](https://fedify.dev/manual/inbox#activity-idempotency)), and
both apps still make their database writes upsert-safe on top of it.

**Failure cleanup.** Fedify retries and then reports permanent delivery
failures; deciding what they mean — prune the follow on 404, delete the
account and cascade on `410 Gone` — is your
`setOutboxPermanentFailureHandler`
([manual/send](https://fedify.dev/manual/send#error-handling)).

## The sharp edges, and where they're written

Traps we found by reading the two codebases (and hitting some ourselves),
each with the page that warns you:

**`Object` and `Image` shadow JS built-ins.** Import with an alias
(`Object as ASObject`) or lose an afternoon. Warned at the top of
[manual/vocab](https://fedify.dev/manual/vocab); visible in both codebases.

**Vocab objects are immutable.** No property assignment after construction —
rebuild with `.clone({ … })`.
[manual/vocab § Immutability](https://fedify.dev/manual/vocab#immutability).

**Cross-origin embedded objects are re-fetched by default.** Secure, but it
costs a round-trip on every boost and quote, and fails when the origin is
down. Hollo passes `crossOrigin: "trust"` at a dozen call sites where the
activity's signature already vouches for the payload. The trade-offs are in
[manual/vocab § Origin-based security model](https://fedify.dev/manual/vocab#origin-based-security-model).

**Never derive an activity `id` from `(actor, object)`.** Follow → Undo →
Follow is three distinct activities; embed a UUID.
[manual/send § Specifying an activity](https://fedify.dev/manual/send#specifying-an-activity).

**Generate both key types.** Mastodon only verifies RSA HTTP signatures;
Ed25519 serves Object Integrity Proofs.
[manual/actor § Public keys](https://fedify.dev/manual/actor#public-keys-of-an-actor).

**Signature negotiation is a live compatibility knob.** Both Hollo and
Hackers' Pub currently pin `firstKnock: "draft-cavage-http-signatures-12"`
to stay compatible with one peer implementation, with a TODO to revert. When
federation to one particular server fails, check this knob early. Options in
[manual/federation](https://fedify.dev/manual/federation).

**Quote posts are still the frontier.** Fedify carries the FEP-044f
vocabulary (`QuoteRequest`, `QuoteAuthorization`, interaction policies), but
both apps hand-build the `RE: <url>` inline-HTML fallback for servers that
don't render quotes, and Hackers' Pub additionally strips Misskey's
inline-quote markup on ingest. This one is *not* in the manual — read
`federation/inbox/quote.ts` and `models/html.ts` in Hackers' Pub.

**The queue's handler timeout doesn't kill the handler.** A slow remote
fetch can outlive the timeout and keep pinning a database connection.
Hackers' Pub bounds every remote fetch with its own `AbortSignal` budget
threaded through the persistence recursion. Also not in the manual — the
long comment in Hackers' Pub's `models/post.ts` is the best writeup.

---

[icon:arrow-left] [Back to Fedify](/build/fedify) ·
[icon:arrow-right] [Running it](/build/fedify/running)
