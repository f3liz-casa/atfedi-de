---
name: "webfinger의 문"
kind: "fedify 본섬 · 첫 번째 문"
repo: "fedify"
plain: "\"@이름@어느 섬\" 같은 수신인에서 그 사람의 진짜 주소(URL)를 찾아보는 전화번호부예요."
related: [fedify-honden, nodeinfo, sea-route]
files:
  - path: "packages/webfinger/src/lookup.ts"
    what: "lookupWebFinger() 클라이언트"
  - path: "packages/webfinger/src/jrd.ts"
    what: "JRD 타입: ResourceDescriptor와 Link"
links:
  - label: "이 문을 GitHub에서 보기"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/webfinger"
---

수신인 하나면, 우주 어디에 있는 누구든 찾아낼 수 있어요. "@friend@mastodon.social"이라고만 적으면, 상대가 어느 서버에 살든 앱은 진짜 주소(URL)를 끌어낼 수 있어요. 직접 만들 때는 `lookupWebFinger()`를 한 번 부르면 돼요 — 전화번호부가 안에서 어떻게 돌아가는지는 몰라도 괜찮아요.

이 꾸러미는 "찾아가는 쪽" 절반만 맡아요. 누가 찾아왔을 때 /.well-known/webfinger로 답하는 쪽은 본당에 살아요. 이 문은 바깥으로 나가는 사람을 위한 거죠.

## 볼거리

- 전체가 1400줄쯤이에요. 섬에서 가장 작은 꾸러미 중 하나죠
- 공개 현관은 lookupWebFinger()(lookup.ts) 딱 하나예요. LookupWebFingerOptions로 동작을 조절해요
- jrd.ts의 ResourceDescriptor와 Link가 WebFinger가 돌려주는 표의 모양 그대로예요

## 경문 한 구절

{% sutra path="packages/webfinger/src/jrd.ts" lines="L5-L9" note="문에서 받는 표의 모양" repo="fedify" %}
```typescript
export interface ResourceDescriptor {
  subject?: string;
  aliases?: string[];
  properties?: Record<string, string | null>;
  links?: Link[];
```
{% /sutra %}

## 만져 보기

{% toy id="webfinger" /%}
