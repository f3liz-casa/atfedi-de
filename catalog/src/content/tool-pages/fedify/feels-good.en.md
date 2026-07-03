## What it feels like

The best way to see fedify is to read the two production codebases written
by fedify's own author: [Hollo](https://github.com/fedify-dev/hollo), a single-user
microblog, and [Hackers' Pub](https://github.com/hackers-pub/hackerspub), a
multi-user blogging platform. In both:

**The whole federation core is one options object.** Hollo's
`createFederation` call — KV store, retrying Postgres queue, signature
negotiation, SSRF policy, tracing — is about two dozen lines
(`src/federation/federation.ts`). The hand-rolled equivalent is a delivery
pipeline, a signing layer, and a key cache you now maintain.

**Your inbox is a routing table.** Hollo wires fifteen activity types in
about eighty lines of `.on(Follow, …).on(Create, …)`. By the time your
handler runs, fedify has verified the HTTP signature and handed you a typed
object. The only signature-related code in all of Hollo is a small hook that
*opts out* of a verification fedify already performed, for one
tombstoned-actor edge case.

**An actor is a database lookup.** Return a `Person` built from your DB row;
content negotiation, WebFinger, NodeInfo routing, and the JSON-LD
`@context` / `publicKey` / `assertionMethod` blocks are fedify's problem.
The key-pairs dispatcher just returns stored JWKs — fedify publishes both
RSA and Ed25519 and picks the right one per peer.

**Delivery to every follower is one call.**
`ctx.sendActivity(user, "followers", activity, { preferSharedInbox: true })`.
Neither app enumerates inboxes, dedupes shared inboxes, or writes any
retry/backoff code. Ordering is one option (`orderingKey`) instead of a
distributed-systems design problem.

**Collections are a cursor convention.** A followers collection is about
forty lines: a windowed SQL query returning `{ items, nextCursor }`. Fedify
emits the `OrderedCollection` pages, `next`, and `totalItems`.

---

[icon:arrow-left] [Back to Fedify](/build/fedify) ·
[icon:arrow-right] [Keep in mind](/build/fedify/watch-out)
