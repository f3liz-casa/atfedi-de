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

You connect small islands to one another all at once. Instead of writing letter by letter to each one, subscribe to a lighthouse and the sea's news arrives in a batch. For a sparsely populated island, whether a relay exists changes the whole experience of federation—and this is the kit for building that lighthouse yourself.

Offshore there are two styles, Mastodon and LitePub, and their subscription handshakes differ slightly. So this lighthouse wears both faces at once.

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
