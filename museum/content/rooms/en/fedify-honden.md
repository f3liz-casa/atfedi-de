---
name: "The Federation Chamber"
kind: "fedify Main Island · Main Hall"
repo: "fedify"
plain: "It receives the letters that arrive and sends out the ones that leave—the main post office."
related: [sig, kura, vocab, bridges, hp-fed]
files:
  - path: "packages/fedify/src/federation/middleware.ts"
    what: "4,697 lines of working body: FederationImpl, the contexts, and KvSpecDeterminer"
  - path: "packages/fedify/src/federation/federation.ts"
    what: "The book of promises: the Federation/FederationBuilder types and contracts"
  - path: "packages/fedify/src/federation/builder.ts"
    what: "The build-it-later method (FederationBuilderImpl)"
  - path: "packages/fedify/src/federation/inbox.ts"
    what: "Sorting documents that arrive at the inbox"
links:
  - label: "See this chamber on GitHub"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/fedify/src/federation"
---

The heart of fedify. Receiving documents at the inbox, dispatching from the outbox, keeping the actor ledger—the Federation here presides over the whole business of federation.

The floor-plan numbers are already worth the visit. A single middleware.ts runs 4,697 lines. FederationImpl, ContextImpl, InboxContextImpl, OutboxContextImpl—nearly all the working substance lives in this one file, while the neighboring federation.ts (1,615 lines) is almost entirely types and contracts. The book of promises and the working body are kept as two clearly separate scrolls.

My favorite corner is a small ledger called KvSpecDeterminer. For each remote island (origin), it notes down in the storehouse (KvStore) which wax-seal etiquette worked for that party. Federation is in a transitional moment for its rites, and not everyone can read the same etiquette—so it remembers.

## Highlights

- builder.ts (1,460 lines) is the build-it-later method. hackers.pub uses this FederationBuilder to raise its parts as separate wings.
- Reliability partitions share the room: circuit-breaker.ts (keep some distance from an ailing party), idempotency.ts (don't read the same document twice), retry.ts, keycache.ts.
- negotiation.ts is the cushion for content negotiation—serving HTML or JSON-LD from the same URL.

## A passage from the sutra

{% sutra path="packages/fedify/src/federation/middleware.ts" lines="L4631-L4650" note="For each party, note down the etiquette that worked" repo="fedify" %}
```typescript
  async determineSpec(
    origin: string,
  ): Promise<HttpMessageSignaturesSpec> {
    return await this.kv.get<HttpMessageSignaturesSpec>([
      ...this.prefix,
      origin,
    ]) ?? this.defaultSpec;
  }

  async rememberSpec(
    origin: string,
    spec: HttpMessageSignaturesSpec,
  ): Promise<void> {
    await this.kv.set([...this.prefix, origin], spec);
  }
```
{% /sutra %}
