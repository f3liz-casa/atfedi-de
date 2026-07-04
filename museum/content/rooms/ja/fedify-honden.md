---
name: "連合の間"
kind: "fedify 本島・本堂"
repo: "fedify"
plain: "届いた手紙を受け取り、出す手紙を送り出す——郵便局の本局にあたる部屋です。"
related: [sig, kura, vocab, bridges, hp-fed]
files:
  - path: "packages/fedify/src/federation/middleware.ts"
    what: "4697行の働く体。FederationImplと文脈たち、KvSpecDeterminer"
  - path: "packages/fedify/src/federation/federation.ts"
    what: "約束の書。Federation/FederationBuilderの型と契約"
  - path: "packages/fedify/src/federation/builder.ts"
    what: "あとから建てる工法(FederationBuilderImpl)"
  - path: "packages/fedify/src/federation/inbox.ts"
    what: "inboxに届いた文書の振り分け"
links:
  - label: "この間をGitHubで見る"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/fedify/src/federation"
---

この間があるから、「連合するアプリ」が数行で建ちます。inboxの受付、outboxの発送、actorの台帳、失敗した配達のやり直し——連合のいとなみを丸ごと任せて、あなたはアプリの中身(何を投稿できて、どう見せるか)だけを考えられる。holloもhackers.pubも、そうやって建ちました。

いちばん好きな一角は、KvSpecDeterminerという小さな帳面です。相手の島ごとに「どの封蝋の作法が通じたか」を覚えておく。連合は儀典の過渡期で、全員が同じ作法を読めるわけではない——そういう現実との付き合い方まで、任せられます。

## 見どころ

- builder.ts(1460行)は「あとから建てる」工法。hackers.pubはこのFederationBuilderで棟を分けて建てている
- 信頼性の間仕切りが同居: circuit-breaker.ts(不調の相手とは少し距離を置く)、idempotency.ts(同じ文書の二度読み防止)、retry.ts、keycache.ts
- negotiation.ts が、同じURLでHTMLとJSON-LDを出し分けるcontent negotiationの座布団

## 経文の一節

{% sutra path="packages/fedify/src/federation/middleware.ts" lines="L4631-L4650" note="相手ごとに、通じた作法を帳面につけておく" repo="fedify" %}
```typescript
  async determineSpec(
    origin: string,
  ): Promise<HttpMessageSignaturesSpec> {
    return await this.kv.get<HttpMessageSignaturesSpec>([
      ...this.prefix,
      origin,
    ]) ?? this.defaultSpec;
  }

  async rememberSpec(
    origin: string,
    spec: HttpMessageSignaturesSpec,
  ): Promise<void> {
    await this.kv.set([...this.prefix, origin], spec);
  }
```
{% /sutra %}
