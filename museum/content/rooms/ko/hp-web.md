---
name: "열람실(web)"
kind: "hackers.pub 관"
repo: "hp"
plain: "hackers.pub에서, 브라우저에 보이는 화면 부분이에요."
related: [hp-graphql, hp-fed, hp-models, hp-bunsha]
files:
  - path: "web/main.ts"
    what: "Fresh 기동. Yoga 동거, 문지기 딸림"
  - path: "web/routes/@[username]"
    what: "프로필 샛길(글/팔로워/게시물의 방)"
  - path: "web/islands/Composer.tsx"
    what: "대화의 툇마루를 대표하는 섬 — 게시물을 쓰는 섬"
  - path: "web/federation.ts"
    what: "설계도(builder)에 숨을 불어넣는 곳"
links:
  - label: "이 동을 GitHub에서 보기"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/web"
---

Fresh 2.0(alpha) 열람실이에요. routes/ 아래가 그대로 복도의 도면이고, @[username]/ 샛길에 프로필, 글 목록, 팔로워, 게시물 한 장씩의 방이 늘어서 있어요.

"섬(islands)"이라는 말이, 이 관에서는 건축 용어예요. 클라이언트에서 도는 JS는 Composer, Editor, PollCard, RemoteFollowModal 같은 대화의 툇마루뿐이에요. 나머지는 전부 서버에서 짠 HTML이에요. 조용한 독서실에, 필요한 곳에만 작은 섬이 떠 있는 거죠.

그리고 이 동 자체는 얇은 조립 층이에요. db, drive, email, kv, federation 배선만 직접 챙기고, 알맹이 일은 models/graphql/federation 동에 넘겨요.

## 볼거리

- main.ts는 Fresh의 fsRoutes에 더해, GraphQL Yoga 서버와 업로드 proxy까지 함께 두고, 입구에서 ActorSuspendedError/isActorBanned 문지기를 거쳐요
- web/db.ts의 postgres 풀은 max:20이에요 — "배달 큐 병렬 10보다 넓히지 않으면, 연합이 붐빌 때 연결이 굶는다"라는 주석이 붙어 있어요
- sitemaps.xml.ts나 robots.txt.ts까지, 복도(routes)의 일부로 파일로 놓여 있어요

## 경문 한 구절

{% sutra path="web/db.ts" lines="L14-L24" note="못의 넓이를, 배달의 병렬 정도에 맞춰 파요" repo="hp" %}
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
