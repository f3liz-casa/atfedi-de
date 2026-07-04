---
name: "照会室(graphql)"
kind: "hackers.pub 館"
repo: "hp"
plain: "新しい画面のためにデータを問い合わせる窓口(GraphQL)です。"
related: [hp-models, hp-web]
files:
  - path: "graphql/builder.ts"
    what: "九枚のプラグインと関税、drizzleの貼り直しパッチ"
  - path: "graphql/mod.ts"
    what: "各領域を副作用importで集めてtoSchema()"
  - path: "graphql/server.ts"
    what: "Yogaサーバ。Bearer→セッションの文脈作り"
  - path: "graphql/post.ts"
    what: "一冊のpostTableが三つの顔に化けるところ"
links:
  - label: "この棟をGitHubで見る"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/graphql"
---

画面がほしいデータを、ほしい形で、一度に聞けます。新しい画面を作るたびにサーバへ新しい窓口を頼まなくていい——次の館(web-next)がどんな姿になっても、この照会室が応えます。

いちばんの見どころは、同じpostTableがNote、Article、Questionという三つの顔に化けること。台帳は一冊なのに、照会の窓からは三種類の資料に見える。

## 見どころ

- 権限はscope-based: signed(セッションあり)と、台帳を引いて確かめるasyncなmoderator
- 問いの重さに関税がある——匿名は深さ11・複雑度20000まで、署名済みは20・25000まで
- drizzle-orm rc.2の癖(getTableConfigの主キー列が別インスタンスを返す)を、名前で貼り直す率直なパッチがbuilder.tsにある
- 領域ごとに一件一ファイル(account.ts、post.ts、poll.ts、moderation.ts……)+併設テスト

## 経文の一節

{% sutra path="graphql/builder.ts" lines="L213-L224" note="九枚のプラグインの重ね着" repo="hp" %}
```typescript
export const builder = new SchemaBuilder<PothosTypes>({
  plugins: [
    ComplexityPlugin,
    RelayPlugin,
    ScopeAuthPlugin,
    DrizzlePlugin,
    DataloaderPlugin,
    SimpleObjectsPlugin,
    TracingPlugin,
    WithInputPlugin,
    ErrorsPlugin,
  ],
```
{% /sutra %}
