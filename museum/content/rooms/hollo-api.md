---
name: "受付(Mastodon API)"
kind: "hollo 館・2F"
repo: "hollo"
plain: "手持ちのMastodonアプリがそのまま使えるようにする、互換の窓口です。"
related: [hollo-fed, hollo-oauth, hollo-bunsha]
files:
  - path: "src/api/index.ts"
    what: "Mastodon API の根。compress+CORS、v1/v2をマウント"
  - path: "src/api/v1/statuses.ts"
    what: "投稿のCRUDとブースト/ふぁぼ。配達もここから"
  - path: "src/api/v2/index.ts"
    what: "v2 search。fedifyのlookupObjectで外まで探す"
  - path: "src/oauth/middleware.ts"
    what: "tokenRequired/scopeRequiredなど、全書き込みが通る廊下"
links:
  - label: "この階をGitHubで見る"
    href: "https://github.com/fedify-dev/hollo/tree/main/src/api"
---

手持ちのMastodonアプリが、そのまま話しかけられる窓口です。v1には14本の資源ルータ(accounts、statuses、timelines、notifications……)が並び、認証は tokenRequired → scopeRequired → withAccountOwner という三段の廊下を通ってから各部屋へ。

面白いのは、受付が翻訳係でもあることです。アプリが「投稿して」と言うと、ハンドラの中でそのままfedifyの文脈(fedCtx)を使って、外の宇宙への配達まで済ませてしまう——明示の宛先にひとたび、followersへもうひとたび、sendActivity()を二度。受付と外交室が、廊下続きになっています。

## 見どころ

- `src/api/index.ts` はhono/compressとCORS(Linkヘッダ公開)を先に立ててから、v1/v2をマウント
- バリデーションは@hono/zod-validator+インラインのzod。v2 searchはlimitを1〜40にclampする
- 配達には投稿IRI由来のorderingKeyを添え、excludeBaseUrisで自分の島への誤配を防ぐ
- v2 searchはresolve=trueだとlookupObject()で外の宇宙まで探しに行き、見つけたらpersistAccount/persistPostで台帳に写してから答える

## 経文の一節

{% sutra path="src/api/v1/statuses.ts" lines="L601-L618" note="投稿ハンドラの中から、そのまま外交(配達)が始まる" repo="hollo" %}
```typescript
    const activity = toCreate(post, fedCtx);
    const orderingKey = getPostOrderingKey(post.iri);
    await fedCtx.sendActivity(
      { username: handle },
      getRecipients(post),
      activity,
      {
        orderingKey,
        excludeBaseUris: [new URL(c.req.url)],
      },
    );
    if (post.visibility !== "direct") {
      await fedCtx.sendActivity({ username: handle }, "followers", activity, {
```
{% /sutra %}
