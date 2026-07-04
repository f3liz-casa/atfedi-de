---
name: "relay 등대"
kind: "앞바다 바위"
repo: "fedify"
plain: "여러 섬으로 편지를 한데 모아 배달해 주는 중계 서버 장치예요."
related: [fedify-honden, sea-route, kobo]
files:
  - path: "packages/relay/src/factory.ts"
    what: "createRelay() — 방식이 갈리는 갈림길"
  - path: "packages/relay/src/mastodon.ts"
    what: "Mastodon 식 릴레이"
  - path: "packages/relay/src/litepub.ts"
    what: "LitePub 식 릴레이"
  - path: "packages/relay/src/follow.ts"
    what: "Follow의 악수(구독/해지)"
links:
  - label: "이 등대를 GitHub에서 보기"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/relay"
---

일대일로 편지를 주고받는 대신, 등대가 한데 맡아서 돌며 배달해 줘요 — ActivityPub 릴레이의 등대예요. fedify 2.0.0부터 나온 새 얼굴이죠.

앞바다에는 두 가지 방식이 있어요. Mastodon 식과 LitePub 식인데, 구독하는 악수가 미묘하게 달라요. 그래서 BaseRelay의 자식으로 MastodonRelay와 LitePubRelay 둘이 살고, createRelay()가 어느 쪽을 밝힐지 골라요.

## 볼거리

- 구독도 해지도 Follow의 악수(follow.ts)예요 — 등대도 또한 하나의 actor죠
- 두 방식 모두에 테스트가 딸려 있어요(mastodon.test.ts / litepub.test.ts)
- 약 2900줄이에요. relay 서버를 직접 만들고 싶은 섬을 위한 등대 키트죠

## 경문 한 구절

{% sutra path="packages/relay/src/factory.ts" lines="L26-L36" note="두 가지 방식이 갈리는 길" repo="fedify" %}
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
