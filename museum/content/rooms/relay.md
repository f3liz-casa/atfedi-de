---
name: "relay 灯台"
kind: "沖の岩"
repo: "fedify"
plain: "たくさんの島へ手紙をまとめて配ってくれる、中継サーバの仕組みです。"
related: [fedify-honden, sea-route, kobo]
files:
  - path: "packages/relay/src/factory.ts"
    what: "createRelay()——流儀の分かれ道"
  - path: "packages/relay/src/mastodon.ts"
    what: "Mastodon流のリレー"
  - path: "packages/relay/src/litepub.ts"
    what: "LitePub流のリレー"
  - path: "packages/relay/src/follow.ts"
    what: "Followの握手(購読/解約)"
links:
  - label: "この灯台をGitHubで見る"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/relay"
---

一対一で文通する代わりに、灯台がまとめて預かって配って回る——ActivityPubリレーの灯台です。fedify 2.0.0からの新顔。

沖には二つの流儀があります。Mastodon流とLitePub流で、購読の握手が微妙に違う。だからBaseRelayの子としてMastodonRelayとLitePubRelayの二人が住んでいて、createRelay()がどちらを灯すかを選びます。

## 見どころ

- 購読も解約もFollowの握手(follow.ts)——灯台もまた、ひとりのactor
- 両方の流儀にテストが併設(mastodon.test.ts / litepub.test.ts)
- 約2900行。relayサーバを自作したい島のための、灯台キット

## 経文の一節

{% sutra path="packages/relay/src/factory.ts" lines="L26-L36" note="二つの流儀の、分かれ道" repo="fedify" %}
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
