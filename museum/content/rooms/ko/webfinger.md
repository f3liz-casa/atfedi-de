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

섬의 첫 번째 문이에요. "@handle@host"라는 이름을 actor의 주소(URL)로 풀어줘요 — 연합 우주에서 누군가를 찾아가는 여정은 언제나 이 문을 지나면서 시작돼요.

꾸러미로 보면 작아서, 공개된 입구는 lookupWebFinger() 하나뿐이에요. 돌아오는 건 JRD(JSON Resource Descriptor)라는 표인데, subject(이름), aliases(다른 이름), links(이 사람의 actor 문서는 여기, 하고 알려주는 길잡이)가 적혀 있어요.

재미있는 건, 이 꾸러미가 "찾아가는 쪽" 절반만 맡는다는 점이에요. 누가 찾아왔을 때 /.well-known/webfinger로 답하는 쪽은 본당(federation/webfinger.ts)에 살아요. 이 문은 바깥으로 나가는 사람을 위한 거죠.

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
