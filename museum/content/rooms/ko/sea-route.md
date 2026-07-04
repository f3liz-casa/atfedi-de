---
name: "외교 항로"
kind: "외교의 바다"
plain: "연합 SNS끼리 편지를 주고받는 공통 규칙 — ActivityPub의 바다예요."
related: [webfinger, sig, fedify-honden, relay]
links:
  - label: "ActivityPub (W3C 권고)"
    href: "https://www.w3.org/TR/activitypub/"
  - label: "ActivityStreams 2.0 어휘"
    href: "https://www.w3.org/TR/activitystreams-vocabulary/"
---

이 바다가 있어서, 서로 다른 회사의, 서로 다른 개인의, 서로 다른 소프트웨어가 같은 타임라인에서 이어져요. Mastodon에서 hollo에 사는 사람을 팔로우할 수 있는 것도, hackers.pub의 글이 Misskey로 흘러 들어오는 것도, 모두 이 공통 의전 — ActivityPub — 덕분이에요.

배가 나르는 외교 문서는 Activity라고 부르는 JSON-LD 꾸러미예요. "팔로우할게요(Follow)", "이걸 만들었어요(Create)". 봉랍에는 HTTP 서명 — 틀림없이 그 섬의 주인이 보냈다는 걸 받는 쪽이 확인할 수 있도록요.

## 볼거리

- 수신인을 푸는 일은 언제나 [webfinger의 문](/ko/section/fedify/rooms/webfinger/)에서 시작해요. "@handle@host"라는 이름이 먼저 actor의 URL로 풀려요
- 문서는 맨 JSON이 아니라 JSON-LD예요. 어휘의 뜻은 `@context`가 짊어져요 — 그래서 배는 사전째로 나르고 있죠
- 봉랍(HTTP 서명)에는 새 방식과 옛 방식 두 가지가 있고, fedify의 [의전의 방](/ko/section/fedify/rooms/sig/)은 상대에 맞춰 가려 써요
- 답장은 오지 않는 게 보통이에요(fire-and-forget). 닿았는지 아닌지는 HTTP 응답 코드만이 알려줘요
