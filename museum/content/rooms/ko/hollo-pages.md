---
name: "사랑방"
kind: "hollo 관 · 3층"
repo: "hollo"
plain: "hollo에서, 브라우저로 보이는 공개 프로필과 게시물 페이지예요."
related: [hollo-api, hollo-fed, webfinger]
files:
  - path: "src/pages/index.tsx"
    what: "공개·관리 페이지를 묶는 부모 라우터"
  - path: "src/pages/profile/index.tsx"
    what: "공개 프로필. drizzle 페이징과 activity+json alternate 링크"
  - path: "src/pages/profile/profilePost.tsx"
    what: "게시물 한 장의 영구 링크 페이지"
  - path: "src/pages/federation.tsx"
    what: "관리자가 원격 actor/post를 가져오는 대시보드"
links:
  - label: "이 층을 GitHub에서 보기"
    href: "https://github.com/fedify-dev/hollo/tree/main/src/pages"
---

현관 앞의 공개 페이지들이에요. 프로필도, 게시물 한 장짜리 페이지도 SPA가 아니라, 서버에서 JSX(hono/jsx)를 짜서 그대로 돌려주는 조용한 구조예요. 찾아온 사람의 브라우저에는 다 만들어진 HTML만 도착해요.

이 사랑방의 가장 큰 볼거리는, 같은 현관이 두 얼굴을 가진다는 점이에요. 브라우저로 `/@handle`을 찾아가면 사람을 위한 사랑방으로 안내받지만, Accept 헤더로 activity+json을 내세워 찾아가면 같은 주소에서 fedify의 actor 디스패처가 ActivityPub 문서를 돌려줘요. 페이지 머리에는 "이 주소의 연합용 얼굴은 이쪽"이라는 alternate 링크도 붙어 있어요.

## 볼거리

- `src/pages/index.tsx`가 한 장의 Hono 라우터로, home·profile(`/:handle{@[^/]+}`)·login·setup·이모지 관리 같은 하위 페이지를 전부 묶어요
- 프로필의 게시물은 drizzle로 곧바로 가져와요(PAGE_SIZE=30, public+unlisted만). page나 cont 쿼리는 살펴보고, 수상하면 404예요
- 게시물 HTML은 보여주기 전에 xss 새니타이저를 거쳐요
- 관리 화면 쪽은 csrf()+loginRequired로 지키고, `federation.tsx`에는 관리자가 손수 원격 actor/post를 가져와 장부에 옮겨 적는 작은 끌어들이는 입구까지 있어요

## 경문 한 구절

{% sutra path="src/pages/profile/index.tsx" lines="L220-L232" note="같은 주소의, 연합용 또 하나의 얼굴로 가는 안내판" repo="hollo" %}
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
