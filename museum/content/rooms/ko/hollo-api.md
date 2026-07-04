---
name: "접수처(Mastodon API)"
kind: "hollo 관 · 2층"
repo: "hollo"
plain: "쓰던 Mastodon 앱을 그대로 쓸 수 있게 해 주는, 호환 창구예요."
related: [hollo-fed, hollo-oauth, hollo-bunsha]
files:
  - path: "src/api/index.ts"
    what: "Mastodon API의 뿌리. compress+CORS, v1/v2를 마운트"
  - path: "src/api/v1/statuses.ts"
    what: "게시물 CRUD와 부스트/좋아요. 배달도 여기서"
  - path: "src/api/v2/index.ts"
    what: "v2 search. fedify의 lookupObject로 바깥까지 찾아요"
  - path: "src/oauth/middleware.ts"
    what: "tokenRequired/scopeRequired 같은, 모든 쓰기가 지나는 복도"
links:
  - label: "이 층을 GitHub에서 보기"
    href: "https://github.com/fedify-dev/hollo/tree/main/src/api"
---

쓰던 Mastodon 앱으로 그대로 지낼 수 있어요. IceCubes든 Toot!이든, 접속할 곳만 hollo로 바꾸면 돼요. 서버를 옮겨도 손에 익은 앱은 그대로 — 그게 이 접수처의 약속이에요.

그리고 접수처는 번역 담당이기도 해요. 앱이 "게시해 줘"라고 하면, 그대로 바깥 우주로 배달하는 일까지 끝내 버려요. 접수처와 외교실이 복도로 이어져 있어요.

## 볼거리

- `src/api/index.ts`는 hono/compress와 CORS(Link 헤더 공개)를 먼저 세우고 나서, v1/v2를 마운트해요
- 검증은 @hono/zod-validator+인라인 zod예요. v2 search는 limit을 1~40으로 clamp해요
- 배달에는 게시물 IRI에서 나온 orderingKey를 붙이고, excludeBaseUris로 자기 섬으로 잘못 배달되는 걸 막아요
- v2 search는 resolve=true면 lookupObject()로 바깥 우주까지 찾으러 가고, 찾으면 persistAccount/persistPost로 장부에 옮겨 적고 나서 답해요

## 경문 한 구절

{% sutra path="src/api/v1/statuses.ts" lines="L601-L618" note="게시물 핸들러 안에서, 그대로 외교(배달)가 시작돼요" repo="hollo" %}
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
