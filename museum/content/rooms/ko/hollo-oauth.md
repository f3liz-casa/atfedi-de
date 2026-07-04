---
name: "열쇠의 방"
kind: "hollo 관 · 별채"
repo: "hollo"
plain: "앱에 '대신 게시해도 좋다'라는 여벌 열쇠를 건네는 구조예요."
related: [hollo-api, hollo-pages]
files:
  - path: "src/oauth.tsx"
    what: "/authorize와 /token. PKCE S256, FOR UPDATE로 맞바꿈"
  - path: "src/oauth/middleware.ts"
    what: "tokenRequired/scopeRequired+클라이언트 인증 세 가지"
  - path: "src/oauth/endpoints/metadata.ts"
    what: "RFC 8414 안내판"
links:
  - label: "이 별채를 GitHub에서 보기"
    href: "https://github.com/fedify-dev/hollo/blob/main/src/oauth.tsx"
---

앱에 여벌 열쇠(토큰)를 만들어 건네는 별채예요. 라우터는 `src/oauth.tsx` 한 장에, /authorize와 /token이 함께 살아요.

열쇠를 만드는 솜씨가 꼼꼼해요. PKCE는 S256만 받고, 평문 challenge는 문 앞에서 돌려보내요. 여벌 열쇠를 맞바꿀 때(authorization_code 교환)는, 교환권에 SELECT ... FOR UPDATE 행 잠금을 걸고, challenge를 스스로 다시 계산해서 timingSafeEqualString으로 비교해요 — 같은 표를 두 번 쓰는 것도, 시간 차로 엿보는 훔쳐보기도, 만듦새 쪽에서 막아 뒀어요.

## 볼거리

- 클라이언트 인증은 client_secret_basic / client_secret_post / none(공개 클라이언트), 세 가지예요
- /token·/revoke·/userinfo는 csrf()에서 일부러 빼 뒀어요(벽의 주석에 이유가 적혀 있어요)
- `/.well-known/oauth-authorization-server`(RFC 8414) 안내판도 관의 뿌리에 서 있어요

## 경문 한 구절

{% sutra path="src/oauth.tsx" lines="L323-L343" note="PKCE 검사 — 스스로 다시 계산해서, 시간이 일정한 비교로" repo="hollo" %}
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

## 만져 보기

{% toy id="pkce" /%}
