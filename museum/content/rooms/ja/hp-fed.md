---
name: "外交室(federation)"
kind: "hackers.pub 館"
repo: "hp"
plain: "hackers.pubが外のサーバと手紙をやり取りする部屋。実務はfedifyに任せています。"
related: [hp-bunsha, fedify-honden, hp-models]
files:
  - path: "federation/builder.ts"
    what: "空の設計図(createFederationBuilder)"
  - path: "federation/inbox/mod.ts"
    what: "動詞の路線図。16種の.on()"
  - path: "federation/actor.ts"
    what: "インスタンスactor/住人actor/墓標の三択"
  - path: "federation/mod.ts"
    what: "副作用importで棟を組み上げて再輸出"
links:
  - label: "この棟をGitHubで見る"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/federation"
---

holloと同じことが、Denoでもできます。外交の間取りを共有の設計図(builder)にしておけば、複数の棟から同じ配線を使い回せる——大きくなるアプリの、連合の置き場所の見本です。

inbox/mod.tsは、動詞の路線図として読めます。Accept、Follow、Undo……多義的な動詞は中身を見て振り分ける。届く手紙の種類が、一枚で見渡せます。

## 見どころ

- 共有inboxは/ap/inbox、個別は/ap/actors/{identifier}/inbox。identifierはアカウントのUUIDか、インスタンスそのもののhostname
- インスタンスactorは「Hackers’ Pub」というApplication。削除された住人はnullではなくKeyedTombstone(墓標)になる——リンクの先に、不在の形が残る
- ハンドラはonPostCreated、onFollowed、onQuoteRequestedと名前つきの関数に分けられ、それぞれにテストが併設

## 経文の一節

{% sutra path="federation/inbox/mod.ts" lines="L53-L63" note="Acceptが届いたら、三つの可能性を順に尋ねる" repo="hp" %}
```typescript
builder
  .setInboxListeners("/ap/actors/{identifier}/inbox", "/ap/inbox")
  .setSharedKeyDispatcher((ctx) => ({
    identifier: new URL(ctx.canonicalOrigin).hostname,
  }))
  .onUnverifiedActivity(onUnverifiedActivity)
  .on(Accept, async (fedCtx, accept) => {
    if (await onQuoteRequestAccepted(fedCtx, accept)) return;
    if (await onRelayFollowAccepted(fedCtx, accept)) return;
    await onFollowAccepted(fedCtx, accept);
  })
```
{% /sutra %}
