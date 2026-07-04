---
name: "곳간 구역"
kind: "fedify 본섬"
repo: "fedify"
plain: "보낼 편지를 잠시 맡아 두는 선반과, 차례대로 나르는 장치. 데이터를 두는 곳이에요."
related: [fedify-honden, hollo-fed, hp-bunsha]
files:
  - path: "packages/fedify/src/federation/kv.ts"
    what: "KvStore의 입구: get/set/delete+cas+list"
  - path: "packages/fedify/src/federation/mq.ts"
    what: "MessageQueue의 입구: enqueue/listen+nativeRetrial"
  - path: "packages/redis/src"
    what: "Redis 곳간. JsonCodec 갈아 끼우기 식"
  - path: "packages/amqp/src"
    what: "파발꾼 오두막(큐만, 선반 없음)"
links:
  - label: "곳간 나열을 GitHub에서 보기"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages"
---

postgres, redis, sqlite, mysql, denokv 곳간과, amqp 파발꾼 오두막. 전부 만듦새가 다른데도 본당에서는 똑같아 보여요 — 곳간 입구가 KvStore(get/set/delete)와 MessageQueue(enqueue/listen) 두 가지 모양으로 정해져 있거든요.

amqp 오두막에는 KvStore가 없어요. RabbitMQ는 전언을 나르는 도구이지 선반이 아니거든요 — 못 하는 일은 맡지 않아요. 이 "없는 건 없다"도 이 구역의 설계 가운데 하나예요.

## 볼거리

- 입구 정의는 본당 쪽에 있어요: federation/kv.ts와 federation/mq.ts. cas()(compare-and-swap)는 1.8.0부터, list()는 2.0.0부터예요
- MessageQueue의 nativeRetrial 플래그 — 곳간이 자기 재전송을 갖고 있으면, fedify는 자기 재전송을 그만두고 양보해요
- redis 곳간은 JsonCodec을 갈아 끼울 수 있고, CodecError/EncodingError/DecodingError 오류 표 한 벌도 갖췄어요
- sqlite 곳간은 얇은 SqliteDatabase 층을 직접 함께 넣어요. 참고로 hollo도 hackers.pub도 고른 건 postgres 곳간이었어요

## 경문 한 구절

{% sutra path="packages/fedify/src/federation/mq.ts" lines="L78-L88" note="곳간이 스스로 재전송할 수 있으면 fedify는 양보해요" repo="fedify" %}
```typescript
export interface MessageQueue {
  /**
   * Whether the message queue backend provides native retry mechanisms.
   * When `true`, Fedify will skip its own retry logic and rely on the backend
   * to handle retries. When `false` or omitted, Fedify will handle retries
   * using its own retry policies.
   *
   * @default `false`
   * @since 1.7.0
   */
  readonly nativeRetrial?: boolean;
```
{% /sutra %}

## 만져 보기

{% toy id="queue" /%}
