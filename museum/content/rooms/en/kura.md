---
name: "The Storehouse Quarter"
kind: "fedify Main Island"
repo: "fedify"
plain: "The shelves that hold outgoing letters for a while, and the mechanism that carries them in order. Where the data is kept."
related: [fedify-honden, hollo-fed, hp-bunsha]
files:
  - path: "packages/fedify/src/federation/kv.ts"
    what: "The KvStore interface: get/set/delete + cas + list"
  - path: "packages/fedify/src/federation/mq.ts"
    what: "The MessageQueue interface: enqueue/listen + nativeRetrial"
  - path: "packages/redis/src"
    what: "The Redis storehouse, with a swappable JsonCodec"
  - path: "packages/amqp/src"
    what: "The courier hut (queue only, no shelves)"
links:
  - label: "See the row of storehouses on GitHub"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages"
---

The postgres, redis, sqlite, mysql, and denokv storehouses, and the amqp courier hut. All built differently, yet from the Main Hall they look the same—because a storehouse's interface is fixed to two shapes: KvStore (get/set/delete) and MessageQueue (enqueue/listen).

The amqp hut has no KvStore. RabbitMQ is a tool for passing messages, not a set of shelves—so it doesn't take on work it can't do. This "what isn't there isn't there" is part of the quarter's design too.

## Highlights

- The interface definitions live on the Main Hall side: federation/kv.ts and federation/mq.ts. cas() (compare-and-swap) since 1.8.0, list() since 2.0.0.
- The nativeRetrial flag on MessageQueue—if the storehouse has its own retry, fedify stops its own and yields.
- The redis storehouse allows a swappable JsonCodec, plus a full set of error placards: CodecError/EncodingError/DecodingError.
- The sqlite storehouse bundles its own thin SqliteDatabase layer. Both hollo and hackers.pub, incidentally, chose the postgres storehouse.

## A passage from the sutra

{% sutra path="packages/fedify/src/federation/mq.ts" lines="L78-L88" note="If the storehouse can retry on its own, fedify yields" repo="fedify" %}
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

## Try it yourself

{% toy id="queue" /%}
