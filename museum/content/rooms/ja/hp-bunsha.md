---
name: "fedify 別院(JSR蔵版)"
kind: "hackers.pub 境内・別院"
repo: "hp"
plain: "hackers.pubの中に入っているfedifyライブラリ(JSRから入れた写し)です。"
related: [hp-fed, fedify-honden, vocab, kura, hollo-bunsha]
files:
  - path: "deno.json"
    what: "@fedify/*を2.3.1でpinする蔵版の目録"
  - path: "web/federation.ts"
    what: "builder.build()——設計図に息が入る一箇所"
  - path: "web/db.ts"
    what: "倉と池(接続プール)の按配"
  - path: "federation/builder.ts"
    what: "写経される側の、空の設計図"
links:
  - label: "総本山(fedify本島)へ"
    href: "https://github.com/fedify-dev/fedify"
  - label: "JSR蔵版の目録"
    href: "https://jsr.io/@fedify/fedify"
---

こちらの別院はJSRの蔵版から写経、ワークスペース全体で2.3.1にpinしてあります(fedify本体、vocab、vocab-runtime、postgres、redis)。

設計図(federation棟のbuilder)が生きたFederationになるのは、web/federation.tsのbuilder.build()——ただ一箇所です。倉の選びかたも現実的で、配達キューは必ずPostgres(handlerTimeoutは180秒に延長)、KVはKV_URLがredis:ならRedis、なければPostgres。

そして、貼り紙をよく見てください。firstKnockをdraft-cavageに固定して、「bonfireのissueが直ったら戻す」——holloの外交室と、一字違わぬ同じTODOです。二つの館が同じ痛みを知っていて、同じ貼り紙を貼っている。連合の相互運用性は、こういう小さな貼り紙の集まりでできています。

## 見どころ

- userAgentは HackersPub/(version)。ORIGINは起動時に、http(s)://で始まるか検められる
- UpstashのRedisはIPv6を強制(family: 6)——蔵の鍵にも、地番の事情がある
- postgresのプール(max 20)は、キューの並列(10)より広く——別院の暮らしと館の暮らしが、同じ池の水を飲むから

## 経文の一節

{% sutra path="web/federation.ts" lines="L40-L52" note="設計図に息が入る一箇所。holloと同じ貼り紙ごと" repo="hp" %}
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
