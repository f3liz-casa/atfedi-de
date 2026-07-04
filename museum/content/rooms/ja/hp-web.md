---
name: "閲覧室(web)"
kind: "hackers.pub 館"
repo: "hp"
plain: "hackers.pubの、ブラウザに見えている画面の部分です。"
related: [hp-graphql, hp-fed, hp-models, hp-bunsha]
files:
  - path: "web/main.ts"
    what: "Freshの起動。Yoga同居、門番つき"
  - path: "web/routes/@[username]"
    what: "プロフィールの小路(記事/フォロワー/投稿の間)"
  - path: "web/islands/Composer.tsx"
    what: "対話の縁側の代表——投稿を書く島"
  - path: "web/federation.ts"
    what: "設計図(builder)に息を入れる場所"
links:
  - label: "この棟をGitHubで見る"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/web"
---

読む人は、JSなしでもぜんぶ読めます。書く人には、書き心地のいい島(Composer)がある。速いページと豊かな編集を両立させたいときの、間取りの見本がこの棟です。

「島(islands)」という言葉が、この館では建築用語です。クライアントで動くJSは対話の縁側だけ。あとはぜんぶサーバで組んだHTML——静かな読書室に、必要なところだけ小さな島が浮かんでいます。

## 見どころ

- main.tsはFreshのfsRoutesに加えて、GraphQL Yogaのサーバとアップロードのproxyまで同居させ、入口でActorSuspendedError/isActorBannedの門番を通す
- web/db.tsのpostgresプールはmax:20——「配達キューの並列10より広くしないと、連合の混雑時に接続が飢える」というコメントつき
- sitemaps.xml.tsやrobots.txt.tsまで、廊下(routes)の一部としてファイルで置いてある

## 経文の一節

{% sutra path="web/db.ts" lines="L14-L24" note="池の広さを、配達の並列度に合わせて掘る" repo="hp" %}
```typescript
export const postgres = postgresJs(DATABASE_URL, {
  // The pool size needs to exceed the ParallelMessageQueue concurrency (10)
  // to leave headroom for HTTP handlers and KV store queries.  The default
  // of 10 can cause connection starvation under federation load.
  max: 20,
});
export const db: Database = drizzle({
  relations,
  client: postgres,
  logger: getDatabaseLogger(),
});
```
{% /sutra %}
