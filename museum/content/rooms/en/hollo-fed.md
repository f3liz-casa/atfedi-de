---
name: "The Diplomacy Office"
kind: "Hollo Hall · 1F"
repo: "hollo"
plain: "The room where hollo exchanges letters with outside servers. The real work is left to fedify."
related: [hollo-bunsha, sig, kura, hollo-api]
files:
  - path: "src/federation/federation.ts"
    what: "createFederation() itself. Postgres KV and a parallel queue, the firstKnock posted note"
  - path: "src/federation/actor.ts"
    what: "The dispatcher for the actor, keys (RSA + Ed25519), and collections"
  - path: "src/federation/index.ts"
    what: "The inbox listener. Fifteen kinds of .on() handlers"
  - path: "src/federation/objects.ts"
    what: "Distribution of objects like Note, with a visibility gatekeeper"
links:
  - label: "See this room on GitHub"
    href: "https://github.com/fedify-dev/hollo/tree/main/src/federation"
---

A room where the fedify branch temple takes up residence and is entrusted with all correspondence with the outer universe. createFederation() is called just once in the whole hall—and with that single call, all of hollo becomes one federation node.

The kitchen keeps things spare. Both the KV and the delivery queue run on @fedify/postgres alone (PostgresKvStore plus a 10-way ParallelMessageQueue); there's no Redis, no separate broker. For a small hall, one storehouse is enough.

There's one more honest posted note. The first manner of the wax seal (firstKnock) is deliberately pinned to the old-style draft-cavage, with a comment reading, "revert to RFC 9421 first once the bonfire issue is fixed." To fit the federation's reality—that the other side can't yet read the newer rite—it changes the order of courtesy.

## Highlights

- setKeyPairsDispatcher in `actor.ts` returns two pairs of keys, RSA and Ed25519—to speak with both old towns and new
- The inbox has two mouths: `/@{identifier}/inbox` and the shared `/inbox`. Some fifteen kinds of .on() line up—Follow, Accept, Create, Like, EmojiReact, Announce, Update, Delete, Block, Move, Undo, and more
- A node whose NODE_TYPE is web doesn't start the queue automatically (manuallyStartQueue)—the web duty and the delivery duty can be split
- Set FEDIFY_DEBUG=true and the whole thing is wrapped in createFederationDebugger, letting you peek at the documents passing back and forth

## A passage from the sutra

{% sutra path="src/federation/federation.ts" lines="L43-L58" note="Including the firstKnock posted note. The order of courtesy, fitted to the federation's reality" repo="hollo" %}
```typescript
let federation: Federation<void> & { sink?: Sink } = createFederation<void>({
  kv,
  queue: new ParallelMessageQueue(new PostgresMessageQueue(postgres), 10),
  // Only start the queue automatically if not running as a web-only node
  manuallyStartQueue: nodeType === "web",
  // TODO: Revert to Fedify's default RFC 9421-first behavior once
  // https://github.com/bonfire-networks/activity_pub/issues/8 is fixed and
  // released.
  firstKnock: "draft-cavage-http-signatures-12",
  userAgent: {
    software: `Hollo/${metadata.version}`,
  },
```
{% /sutra %}
