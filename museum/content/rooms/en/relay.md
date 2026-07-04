---
name: "The Relay Lighthouse"
kind: "Offshore Rock"
repo: "fedify"
plain: "A relay-server mechanism that delivers letters to many islands in one batch."
related: [fedify-honden, sea-route, kobo]
files:
  - path: "packages/relay/src/factory.ts"
    what: "createRelay()—the fork between styles"
  - path: "packages/relay/src/mastodon.ts"
    what: "The Mastodon-style relay"
  - path: "packages/relay/src/litepub.ts"
    what: "The LitePub-style relay"
  - path: "packages/relay/src/follow.ts"
    what: "The Follow handshake (subscribe/unsubscribe)"
links:
  - label: "See this lighthouse on GitHub"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/relay"
---

Instead of one-to-one correspondence, a lighthouse takes it all in and carries it around for delivery—the lighthouse of an ActivityPub relay. A new face since fedify 2.0.0.

Offshore there are two styles, Mastodon and LitePub, and their subscription handshakes differ slightly. So two children of BaseRelay live here, MastodonRelay and LitePubRelay, and createRelay() chooses which one to light.

## Highlights

- Both subscribing and unsubscribing are the Follow handshake (follow.ts)—the lighthouse, too, is an actor.
- Both styles come with tests (mastodon.test.ts / litepub.test.ts).
- About 2,900 lines. A lighthouse kit for any island that wants to build its own relay server.

## A passage from the sutra

{% sutra path="packages/relay/src/factory.ts" lines="L26-L36" note="The fork between the two styles" repo="fedify" %}
```typescript
export function createRelay(
  type: RelayType,
  options: RelayOptions,
): Relay {
  switch (type) {
    case "mastodon":
      return new MastodonRelay(options, relayBuilder);
    case "litepub":
      return new LitePubRelay(options, relayBuilder);
  }
}
```
{% /sutra %}
