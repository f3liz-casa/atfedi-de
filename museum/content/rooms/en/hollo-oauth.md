---
name: "The Key Room"
kind: "Hollo Hall · Annex"
repo: "hollo"
plain: "The mechanism that hands an app a duplicate key: \"you may post on your behalf.\""
related: [hollo-api, hollo-pages]
files:
  - path: "src/oauth.tsx"
    what: "/authorize and /token. PKCE S256, the FOR UPDATE redemption"
  - path: "src/oauth/middleware.ts"
    what: "tokenRequired/scopeRequired plus three ways of client authentication"
  - path: "src/oauth/endpoints/metadata.ts"
    what: "The RFC 8414 signpost"
links:
  - label: "See this annex on GitHub"
    href: "https://github.com/fedify-dev/hollo/blob/main/src/oauth.tsx"
---

You can safely hand an app "you may post on your behalf." No password changes hands, only a duplicate key (a token)—and the manner that keeps it from being abused even if it's overheard along the way (PKCE) comes built in.

The keywork is meticulous. Redeeming the duplicate key takes a row lock, and the shadow of the passphrase is checked with a constant-time comparison—using the same ticket twice, and peeking through a gap, are both sealed off by the construction itself.

## Highlights

- Client authentication comes in three ways: client_secret_basic, client_secret_post, and none (public clients)
- /token, /revoke, and /userinfo are intentionally left out of csrf() (with the reason in a comment on the wall)
- The signpost at `/.well-known/oauth-authorization-server` (RFC 8414) also stands at the root of the hall

## A passage from the sutra

{% sutra path="src/oauth.tsx" lines="L323-L343" note="Inspecting PKCE—recomputing it here, comparing in constant time" repo="hollo" %}
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

## Try it yourself

{% toy id="pkce" /%}
