---
name: "외교실(federation)"
kind: "hackers.pub 관"
repo: "hp"
plain: "hackers.pub가 바깥 서버와 편지를 주고받는 방이에요. 실무는 fedify에 맡겨요."
related: [hp-bunsha, fedify-honden, hp-models]
files:
  - path: "federation/builder.ts"
    what: "빈 설계도(createFederationBuilder)"
  - path: "federation/inbox/mod.ts"
    what: "동사의 노선도. 16가지 .on()"
  - path: "federation/actor.ts"
    what: "인스턴스 actor/주민 actor/묘비, 세 갈래"
  - path: "federation/mod.ts"
    what: "부수효과 import로 동을 짜 올려 다시 내보내기"
links:
  - label: "이 동을 GitHub에서 보기"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/federation"
---

hollo와 같은 일을, Deno에서도 할 수 있어요. 외교의 배치를 공유 설계도(builder)로 만들어 두면, 여러 동에서 같은 배선을 돌려쓸 수 있어요 — 커지는 앱의, 연합을 어디에 둘지 보여주는 본보기예요.

inbox/mod.ts는, 동사의 노선도로 읽을 수 있어요. Accept, Follow, Undo…… 뜻이 여럿인 동사는 속을 보고 갈라 보내요. 도착하는 편지의 종류를, 한 장으로 훑어볼 수 있어요.

## 볼거리

- 공유 inbox는 /ap/inbox, 개별은 /ap/actors/{identifier}/inbox예요. identifier는 계정의 UUID이거나, 인스턴스 그 자체의 hostname이에요
- 인스턴스 actor는 "Hackers' Pub"라는 Application이에요. 삭제된 주민은 null이 아니라 KeyedTombstone(묘비)이 돼요 — 링크가 가리키는 끝에, 부재의 모양이 남는 거죠
- 핸들러는 onPostCreated, onFollowed, onQuoteRequested처럼 이름 붙은 함수로 나뉘고, 저마다 테스트가 딸려 있어요

## 경문 한 구절

{% sutra path="federation/inbox/mod.ts" lines="L53-L63" note="Accept가 도착하면, 세 가지 가능성을 차례로 물어봐요" repo="hp" %}
```typescript
builder
  .setInboxListeners("/ap/actors/{identifier}/inbox", "/ap/inbox")
  .setSharedKeyDispatcher((ctx) => ({
    identifier: new URL(ctx.canonicalOrigin).hostname,
  }))
  .onUnverifiedActivity(onUnverifiedActivity)
  .on(Accept, async (fedCtx, accept) => {
    if (await onQuoteRequestAccepted(fedCtx, accept)) return;
    if (await onRelayFollowAccepted(fedCtx, accept)) return;
    await onFollowAccepted(fedCtx, accept);
  })
```
{% /sutra %}
