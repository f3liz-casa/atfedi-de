---
name: "鍵の間"
kind: "hollo 館・離れ"
repo: "hollo"
plain: "アプリに「あなたの代わりに投稿していい」という合鍵を渡す仕組みです。"
related: [hollo-api, hollo-pages]
files:
  - path: "src/oauth.tsx"
    what: "/authorizeと/token。PKCE S256、FOR UPDATEの引き換え"
  - path: "src/oauth/middleware.ts"
    what: "tokenRequired/scopeRequired+クライアント認証三通り"
  - path: "src/oauth/endpoints/metadata.ts"
    what: "RFC 8414の案内板"
links:
  - label: "この離れをGitHubで見る"
    href: "https://github.com/fedify-dev/hollo/blob/main/src/oauth.tsx"
---

アプリに「あなたの代わりに投稿していい」を、安全に渡せます。パスワードは渡さず、合鍵(トークン)だけ。途中で盗み聞きされても悪用できない作法(PKCE)まで込みです。

鍵の作りは几帳面です。合鍵の引き換えには行ロックがかかり、合言葉の影は時間一定の比較で検められる——同じ券の二度使いも、覗き見も、造りのほうで塞いであります。

## 見どころ

- クライアント認証は client_secret_basic / client_secret_post / none(公開クライアント)の三通り
- /token・/revoke・/userinfoはcsrf()から意図的に外してある(壁のコメントに理由つき)
- `/.well-known/oauth-authorization-server`(RFC 8414)の案内板も館の根に立っている

## 経文の一節

{% sutra path="src/oauth.tsx" lines="L323-L343" note="PKCEの検分——自分で再計算して、時間一定の比較で" repo="hollo" %}
```tsx
          if (accessGrant.codeChallenge && accessGrant.codeChallengeMethod) {
            if (
              !form.code_verifier ||
              accessGrant.codeChallengeMethod !== "S256"
            ) {
              return c.json(INVALID_GRANT_ERROR, 400);
            }

            const expectedCodeChallenge = await calculatePKCECodeChallenge(
              form.code_verifier,
            );

            if (
              !timingSafeEqualString(
                expectedCodeChallenge,
                accessGrant.codeChallenge,
              )
            ) {
              return c.json(INVALID_GRANT_ERROR, 400);
            }
          }
```
{% /sutra %}

## さわってみる

{% toy id="pkce" /%}
