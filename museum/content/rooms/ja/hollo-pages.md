---
name: "客間"
kind: "hollo 館・3F"
repo: "hollo"
plain: "holloの、ブラウザで見える公開プロフィールと投稿のページです。"
related: [hollo-api, hollo-fed, webfinger]
files:
  - path: "src/pages/index.tsx"
    what: "公開/管理ページを束ねる親ルータ"
  - path: "src/pages/profile/index.tsx"
    what: "公開プロフィール。drizzleのページングとactivity+json alternateリンク"
  - path: "src/pages/profile/profilePost.tsx"
    what: "投稿一枚の永久リンクページ"
  - path: "src/pages/federation.tsx"
    what: "管理者がリモートのactor/postを取り寄せるダッシュボード"
links:
  - label: "この階をGitHubで見る"
    href: "https://github.com/fedify-dev/hollo/tree/main/src/pages"
---

玄関先の公開ページたちです。プロフィールも、投稿の一枚ページも、SPAではなく、サーバでJSX(hono/jsx)を組み立ててそのまま返す静かな作り。訪ねてきた人のブラウザには、できあがったHTMLだけが届きます。

この客間のいちばんの見どころは、同じ玄関が二つの顔を持つことです。ブラウザで `/@handle` を訪ねると人間向けの客間に通されますが、Acceptヘッダで activity+json を名乗って訪ねると、同じ住所でfedifyのactorディスパッチャがActivityPub文書を返します。ページの頭には「この住所の連合向けの顔はこちら」というalternateリンクも貼ってある。

## 見どころ

- `src/pages/index.tsx` が一枚のHonoルータで、home・profile(`/:handle{@[^/]+}`)・login・setup・絵文字管理などのサブページをぜんぶ束ねる
- プロフィールの投稿はdrizzleで直に引く(PAGE_SIZE=30、public+unlistedのみ)。pageやcontのクエリは検分して、怪しければ404
- 投稿のHTMLは表示前にxssサニタイザを通す
- 管理画面系はcsrf()+loginRequiredで守られ、`federation.tsx`には管理者が手でリモートのactor/postを取り寄せて台帳に写す小さな引き込み口まである

## 経文の一節

{% sutra path="src/pages/profile/index.tsx" lines="L220-L232" note="同じ住所の、連合向けのもう一つの顔への案内板" repo="hollo" %}
```tsx
      links={[
        ...(atomUrl == null
          ? []
          : [
              { rel: "alternate", type: "application/atom+xml", href: atomUrl },
            ]),
        {
          rel: "alternate",
          type: "application/activity+json",
          href: `/@${accountOwner.handle}`,
        },
      ]}
```
{% /sutra %}
