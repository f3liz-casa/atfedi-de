---
name: "서고(models)"
kind: "hackers.pub 관"
repo: "hp"
plain: "게시물이나 계정처럼, 데이터의 모양과 저장을 정하는 장부의 방이에요."
related: [hp-graphql, hp-fed, hp-web]
files:
  - path: "models/schema.ts"
    what: "상(테이블) 54개짜리 장부와 pgEnum들"
  - path: "models/db.ts"
    what: "Database/Transaction 타입과 runInTransaction"
  - path: "models/relations.ts"
    what: "장부끼리의 관계도"
  - path: "models/post.ts"
    what: "대표 한 권. 게시물 작성/동기화/원격 가져오기"
links:
  - label: "이 서고를 GitHub에서 보기"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/models"
---

연합 SNS라는 세계 전부 — 게시물, 팔로우, 차단, 투표, 신고 — 가, 54개의 장부에 어떻게 담기는지를 볼 수 있어요. 직접 연합 앱을 만드는 사람에게, 이 서고는 배치도 참고서예요.

한가운데에 있는 건 runInTransaction()이라는 작은 작법이에요. 이미 트랜잭션 안에 있으면 함께 타고, 밖이면 새로 열어요. 관 곳곳의 동이, 이 하나의 작법에 기대고 있어요.

## 볼거리

- 공개 범위는 pgEnum+TS union 양쪽으로 세워요: public / unlisted / followers / direct / none
- 개념마다 파일과 테스트가 짝을 이뤄요(post.ts/post.test.ts). 게다가 lifecycle·remote·draft처럼, 생활 장면별 테스트까지 나눠 뒀어요
- relations.ts의 관계도를, graphql 조회실(Pothos drizzle)도 이 서고도, 같은 한 장으로 함께 써요

## 경문 한 구절

{% sutra path="models/schema.ts" lines="L31-L39" note="공개 범위의 다섯 단계가, 장부의 말로" repo="hp" %}
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
