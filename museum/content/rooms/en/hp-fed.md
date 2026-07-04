---
name: "The Diplomacy Office (federation)"
kind: "hackers.pub Hall"
repo: "hp"
plain: "The room where hackers.pub exchanges letters with outside servers. The real work is left to fedify."
related: [hp-bunsha, fedify-honden, hp-models]
files:
  - path: "federation/builder.ts"
    what: "The empty blueprint (createFederationBuilder)"
  - path: "federation/inbox/mod.ts"
    what: "The route map of verbs. Sixteen kinds of .on()"
  - path: "federation/actor.ts"
    what: "The three choices: instance actor, resident actor, or tombstone"
  - path: "federation/mod.ts"
    what: "Assembles the wings by side-effect import and re-exports"
links:
  - label: "See this wing on GitHub"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/federation"
---

This wing exists only for fedify's wiring. builder.ts makes an empty FederationBuilder, and everyone in the wing—actor, collections, inbox, objects, outbox, webfinger—hangs their own dispatcher on it by side-effect import. The assembled blueprint isn't alive yet. Breathing life into it is the reading room's job (web/federation.ts).

inbox/mod.ts reads as a route map of verbs. Accept, Follow, Create, Announce, Undo… sixteen kinds of .on(). An ambiguous verb is sorted on the spot by looking inside—when an Undo arrives, it peeks at getObject() to tell whether it's an unfollow, an un-reaction, or an unblock.

## Highlights

- The shared inbox is /ap/inbox, the individual one /ap/actors/{identifier}/inbox. The identifier is an account's UUID, or the hostname of the instance itself
- The instance actor is an Application named "Hackers' Pub". A deleted resident becomes not null but a KeyedTombstone—at the end of the link, the shape of an absence remains
- The handlers are split into named functions—onPostCreated, onFollowed, onQuoteRequested—each with a companion test

## A passage from the sutra

{% sutra path="federation/inbox/mod.ts" lines="L53-L63" note="When an Accept arrives, it asks after three possibilities in turn" repo="hp" %}
```typescript
builder
  .setInboxListeners("/ap/actors/{identifier}/inbox", "/ap/inbox")
  .setSharedKeyDispatcher((ctx) => ({
    identifier: new URL(ctx.canonicalOrigin).hostname,
  }))
  .onUnverifiedActivity(onUnverifiedActivity)
  .on(Accept, async (fedCtx, accept) => {
    if (await onQuoteRequestAccepted(fedCtx, accept)) return;
    if (await onRelayFollowAccepted(fedCtx, accept)) return;
    await onFollowAccepted(fedCtx, accept);
  })
```
{% /sutra %}
