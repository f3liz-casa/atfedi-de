---
name: "fedify 별원(JSR 판본)"
kind: "hackers.pub 경내 · 별원"
repo: "hp"
plain: "hackers.pub 안에 들어 있는 fedify 라이브러리(JSR에서 받은 사본)예요."
related: [hp-fed, fedify-honden, vocab, kura, hollo-bunsha]
files:
  - path: "deno.json"
    what: "@fedify/*를 2.3.1로 pin하는 판본 목록"
  - path: "web/federation.ts"
    what: "builder.build() — 설계도에 숨이 드는 단 한 곳"
  - path: "web/db.ts"
    what: "곳간과 못(연결 풀)의 배분"
  - path: "federation/builder.ts"
    what: "사경되는 쪽의, 빈 설계도"
links:
  - label: "총본산(fedify 본섬)으로"
    href: "https://github.com/fedify-dev/fedify"
  - label: "JSR 판본 목록"
    href: "https://jsr.io/@fedify/fedify"
---

판본이 JSR이어도, 경전은 같아요. 런타임이 Node든 Deno든, 같은 라이브러리로 같은 연합을 할 수 있어요 — 그 실례가 이 탑이에요. 워크스페이스 전체를 2.3.1로 pin해 뒀어요.

쪽지를 잘 봐 주세요. firstKnock을 draft-cavage로 고정하고 "이슈가 고쳐지면 되돌린다" — hollo 외교실과 한 글자도 다르지 않은 같은 TODO예요. 두 관이 같은 아픔을 알고 있어서, 같은 쪽지를 붙여 뒀어요. 연합의 상호 운용성은, 이런 작은 쪽지가 모여서 이뤄지는 거죠.

## 볼거리

- userAgent는 HackersPub/(version)이에요. ORIGIN은 기동할 때 http(s)://로 시작하는지 검사해요
- Upstash의 Redis는 IPv6을 강제해요(family: 6) — 곳간 열쇠에도, 지번 사정이 있는 거죠
- postgres 풀(max 20)은, 큐의 병렬(10)보다 넓어요 — 별원의 살림과 관의 살림이, 같은 못의 물을 마시니까요

## 경문 한 구절

{% sutra path="web/federation.ts" lines="L40-L52" note="설계도에 숨이 드는 단 한 곳. hollo와 같은 쪽지까지 그대로" repo="hp" %}
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
