---
name: "외교실"
kind: "hollo 관 · 1층"
repo: "hollo"
plain: "hollo가 바깥 서버와 편지를 주고받는 방이에요. 실무는 fedify에 맡겨요."
related: [hollo-bunsha, sig, kura, hollo-api]
files:
  - path: "src/federation/federation.ts"
    what: "createFederation() 본체. Postgres KV+병렬 큐, firstKnock 쪽지"
  - path: "src/federation/actor.ts"
    what: "actor와 열쇠(RSA+Ed25519)와 컬렉션 디스패처"
  - path: "src/federation/index.ts"
    what: "inbox 리스너. 15가지 .on() 핸들러"
  - path: "src/federation/objects.ts"
    what: "Note 등 오브젝트 배포. 가시성 문지기 딸림"
links:
  - label: "이 방을 GitHub에서 보기"
    href: "https://github.com/fedify-dev/hollo/tree/main/src/federation"
---

서버 한 대만으로도, 우주 전체와 편지를 나눌 수 있어요. 외교 실무는 fedify 별원에 맡기니까, hollo의 외교는 이 몇 개의 파일로 끝나요 — "내 SNS를 가진다"라는 일이 혼자 하는 취미 프로젝트의 규모에 담기는 이유가 여기 있어요.

살림 형편도 깔끔해요. KV도 배달 큐도 @fedify/postgres 하나로 두고, Redis도 다른 브로커도 두지 않아요. 작은 관에는 곳간이 하나면 넉넉하죠.

## 볼거리

- `actor.ts`의 setKeyPairsDispatcher는 RSA와 Ed25519, 두 쌍의 열쇠를 돌려줘요 — 오래된 마을과도 새 마을과도 이야기하기 위해서죠
- inbox는 `/@{identifier}/inbox`와 공유 `/inbox`, 두 개의 창구예요. Follow/Accept/Create/Like/EmojiReact/Announce/Update/Delete/Block/Move/Undo 등 15가지쯤 되는 .on()이 늘어서 있어요
- NODE_TYPE이 web인 노드는 큐를 자동으로 시작하지 않아요(manuallyStartQueue) — web 담당과 배달 담당을 나눌 수 있죠
- FEDIFY_DEBUG=true로 하면 전체가 createFederationDebugger로 감싸여서, 오가는 문서를 들여다볼 수 있어요

## 경문 한 구절

{% sutra path="src/federation/federation.ts" lines="L43-L58" note="firstKnock 쪽지까지 그대로. 연합의 현실에 맞춘 예의의 순서" repo="hollo" %}
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
