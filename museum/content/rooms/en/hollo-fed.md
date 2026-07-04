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

Even a one-person server can correspond with the whole universe. The real diplomatic work is left to the fedify branch temple, so hollo's diplomacy fits in these few files—here is why "running your own social network" fits within the scale of a single hobby project.

The kitchen keeps things spare, too. Both the KV and the delivery queue run on @fedify/postgres alone; there's no Redis, no separate broker. For a small hall, one storehouse is enough.

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
