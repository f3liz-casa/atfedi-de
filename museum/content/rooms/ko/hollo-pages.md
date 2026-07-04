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

주소를 가질 수 있어요. 내 게시물은, 전용 앱이 없는 사람에게도 URL 하나로 보여줄 수 있어요 — 브라우저로 열면 조용한 페이지, fedi에서 들여다보면 같은 주소가 actor의 얼굴이 돼요.

만듦새는 SPA가 아니라, 서버에서 짠 HTML을 그대로 돌려주는 조용한 방식이에요. 찾아온 사람의 브라우저에는 다 만들어진 페이지만 도착해요.

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
