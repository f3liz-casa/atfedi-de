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

This chamber is what lets a federated app go up in a few lines. Receiving at the inbox, dispatching from the outbox, keeping the actor ledger, retrying deliveries that failed—hand the whole business of federation to it, and you get to think only about what your app is: what people can post, and how it looks. hollo and hackers.pub were both raised this way.

My favorite corner is a small ledger called KvSpecDeterminer. For each remote island, it remembers which wax-seal etiquette worked. Federation is in a transitional moment for its rites, and not everyone can read the same etiquette—so it hands you a way to live with that reality too.

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
