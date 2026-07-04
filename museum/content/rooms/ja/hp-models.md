---
name: "書庫(models)"
kind: "hackers.pub 館"
repo: "hp"
plain: "投稿やアカウントなど、データの形と保存を決めている台帳の部屋です。"
related: [hp-graphql, hp-fed, hp-web]
files:
  - path: "models/schema.ts"
    what: "54卓の台帳とpgEnumたち"
  - path: "models/db.ts"
    what: "Database/Transactionの型とrunInTransaction"
  - path: "models/relations.ts"
    what: "台帳どうしの関係図"
  - path: "models/post.ts"
    what: "代表の一冊。投稿の作成/同期/リモート取り込み"
links:
  - label: "この書庫をGitHubで見る"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/models"
---

ドメインモデルの書庫です。Drizzle ORMのschema.tsに54の卓(テーブル)——account、actor、post、following、blocking、poll、reaction、notification、そしてmoderationの一式まで。連合SNSという世界が、そのまま台帳の形で並んでいます。

芯にあるのはrunInTransaction()という小さな作法。すでにトランザクションの中に居るなら乗り合い、外なら新しく開く。館じゅうの棟が、この一つの作法に寄りかかっています。

## 見どころ

- 公開範囲はpgEnum+TS unionの両建て: public / unlisted / followers / direct / none
- 概念ごとにファイルとテストが対(post.ts/post.test.ts)。しかもlifecycle・remote・draftと、暮らしの場面別のテストまで分けてある
- relations.tsの関係図を、graphqlの照会室(Pothos drizzle)もこの書庫も、同じ一枚で共有する

## 経文の一節

{% sutra path="models/schema.ts" lines="L31-L39" note="公開範囲の五段階が、台帳の言葉で" repo="hp" %}
```typescript
export const POST_VISIBILITIES = [
  "public",
  "unlisted",
  "followers",
  "direct",
  "none",
] as const;

export const postVisibilityEnum = pgEnum("post_visibility", POST_VISIBILITIES);
```
{% /sutra %}
