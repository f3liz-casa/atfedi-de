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

この棟は、fedifyの配線だけのためにあります。builder.tsが空のFederationBuilderを作り、actor、collections、inbox、objects、outbox、webfinger——棟のみんなが副作用importで、自分の担当のディスパッチャを掛けていく。組み上がった設計図は、まだ生きていません。息を吹き込むのは閲覧室側(web/federation.ts)の仕事。

inbox/mod.tsは、動詞の路線図として読めます。Accept、Follow、Create、Announce、Undo……16種の.on()。多義的な動詞は、その場で中身を見て振り分ける——Undoが来たらgetObject()を覗いて、フォロー取り消しか、リアクション取り消しか、ブロック解除かを見極める。

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
