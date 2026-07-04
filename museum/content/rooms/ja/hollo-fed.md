---
name: "外交室"
kind: "hollo 館・1F"
repo: "hollo"
plain: "holloが外のサーバと手紙をやり取りする部屋。実務はfedifyに任せています。"
related: [hollo-bunsha, sig, kura, hollo-api]
files:
  - path: "src/federation/federation.ts"
    what: "createFederation()本体。Postgres KV+並列キュー、firstKnockの貼り紙"
  - path: "src/federation/actor.ts"
    what: "actorと鍵(RSA+Ed25519)とコレクションのディスパッチャ"
  - path: "src/federation/index.ts"
    what: "inboxリスナー。15種の.on()ハンドラ"
  - path: "src/federation/objects.ts"
    what: "Note等のオブジェクト配布。可視性の門番つき"
links:
  - label: "この部屋をGitHubで見る"
    href: "https://github.com/fedify-dev/hollo/tree/main/src/federation"
---

一人のサーバでも、宇宙全体と文通できます。外交の実務はfedify別院に任せているから、holloの外交はこの数ファイルで済んでいる——「自分のSNSを持つ」が、一人の趣味プロジェクトの規模に収まる理由がここにあります。

台所事情も潔い。KVも配達キューも@fedify/postgres一本で、Redisも別のブローカーも置いていません。小さな館には、倉がひとつで足りる。

## 見どころ

- `actor.ts` のsetKeyPairsDispatcherはRSAとEd25519、二対の鍵を返す——古い町とも新しい町とも話すため
- inboxは `/@{identifier}/inbox` と共有 `/inbox` の二枚口。Follow/Accept/Create/Like/EmojiReact/Announce/Update/Delete/Block/Move/Undoなど15種ほどの.on()が並ぶ
- NODE_TYPEがwebのノードはキューを自動起動しない(manuallyStartQueue)——web係と配達係を分けられる
- FEDIFY_DEBUG=trueにすると全体がcreateFederationDebuggerに包まれて、行き交う文書を覗ける

## 経文の一節

{% sutra path="src/federation/federation.ts" lines="L43-L58" note="firstKnockの貼り紙ごと。連合の現実に合わせた礼儀の順番" repo="hollo" %}
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
