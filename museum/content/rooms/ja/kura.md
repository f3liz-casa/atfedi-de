---
name: "倉の区画"
kind: "fedify 本島"
repo: "fedify"
plain: "出す手紙をいったん預かる棚と、順番に運ぶ仕組み。データの置き場です。"
related: [fedify-honden, hollo-fed, hp-bunsha]
files:
  - path: "packages/fedify/src/federation/kv.ts"
    what: "KvStoreの口: get/set/delete+cas+list"
  - path: "packages/fedify/src/federation/mq.ts"
    what: "MessageQueueの口: enqueue/listen+nativeRetrial"
  - path: "packages/redis/src"
    what: "Redisの倉。JsonCodec差し替え式"
  - path: "packages/amqp/src"
    what: "飛脚小屋(キューのみ、棚なし)"
links:
  - label: "倉の並びをGitHubで見る"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages"
---

postgres、redis、sqlite、mysql、denokv の倉と、amqp の飛脚小屋。ぜんぶ違う造りなのに、本堂からは同じに見えます——倉の口が、KvStore(get/set/delete)とMessageQueue(enqueue/listen)という二つの形に決まっているから。

amqpの小屋にはKvStoreがありません。RabbitMQは伝言の道具で、棚ではないから——できない仕事は、引き受けない。この「無いものは無い」も、区画の設計のうちです。

## 見どころ

- 口の定義は本堂側にある: federation/kv.ts と federation/mq.ts。cas()(compare-and-swap)は1.8.0から、list()は2.0.0から
- MessageQueueのnativeRetrialフラグ——倉が自前の再送を持つなら、fedifyは自分の再送をやめて譲る
- redisの倉はJsonCodec差し替え可+CodecError/EncodingError/DecodingErrorの誤り札一式
- sqliteの倉は薄いSqliteDatabase層を自前で同梱。ちなみにholloもhackers.pubも、選んだのはpostgresの倉

## 経文の一節

{% sutra path="packages/fedify/src/federation/mq.ts" lines="L78-L88" note="倉が自分で再送できるなら、fedifyは譲る" repo="fedify" %}
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

## さわってみる

{% toy id="queue" /%}
