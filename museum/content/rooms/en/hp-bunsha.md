---
name: "Fedify Branch Temple (JSR edition)"
kind: "hackers.pub Grounds · Branch Temple"
repo: "hp"
plain: "The fedify library living inside hackers.pub (a copy installed from JSR)."
related: [hp-fed, fedify-honden, vocab, kura, hollo-bunsha]
files:
  - path: "deno.json"
    what: "The edition's catalog, pinning @fedify/* at 2.3.1"
  - path: "web/federation.ts"
    what: "builder.build()—the one place the blueprint draws breath"
  - path: "web/db.ts"
    what: "The balance of storehouse and pond (the connection pool)"
  - path: "federation/builder.ts"
    what: "The empty blueprint, the side that gets copied"
links:
  - label: "To the head temple (fedify Main Island)"
    href: "https://github.com/fedify-dev/fedify"
  - label: "The JSR edition's catalog"
    href: "https://jsr.io/@fedify/fedify"
---

This branch temple is copied like a sutra from the JSR edition, pinned across the whole workspace at 2.3.1 (fedify itself, vocab, vocab-runtime, postgres, redis).

The blueprint (the federation wing's builder) becomes a living Federation at builder.build() in web/federation.ts—just one place. The choice of storehouse is practical, too: the delivery queue is always Postgres (handlerTimeout extended to 180 seconds), and the KV is Redis if KV_URL is redis:, otherwise Postgres.

And look closely at the posted note. firstKnock pinned to draft-cavage, "revert once the bonfire issue is fixed"—the very same TODO as hollo's Diplomacy Office, down to the letter. Two halls know the same pain and post the same note. Federation interoperability is made of gatherings of small posted notes like these.

## Highlights

- The userAgent is HackersPub/(version). ORIGIN is checked at startup for whether it begins with http(s)://
- Upstash's Redis forces IPv6 (family: 6)—even the storehouse key has its matters of address
- The postgres pool (max 20) is wider than the queue's concurrency (10)—because the branch temple's life and the hall's life drink from the same pond

## A passage from the sutra

{% sutra path="web/federation.ts" lines="L40-L52" note="The one place the blueprint draws breath. Including the same posted note as hollo" repo="hp" %}
```typescript
export const federation = await builder.build({
  kv,
  queue,
  origin: ORIGIN,
  // TODO: Revert to Fedify's default RFC 9421-first behavior once
  // https://github.com/bonfire-networks/activity_pub/issues/8 is fixed and
  // released.
  firstKnock: "draft-cavage-http-signatures-12",
  userAgent: {
    software: `HackersPub/${metadata.version}`,
    url: new URL(ORIGIN),
  },
});
```
{% /sutra %}
