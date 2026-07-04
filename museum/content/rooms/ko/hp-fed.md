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

이 동은, fedify 배선만을 위해 있어요. builder.ts가 빈 FederationBuilder를 만들고, actor, collections, inbox, objects, outbox, webfinger — 동의 모두가 부수효과 import로, 자기가 맡은 디스패처를 걸어 나가요. 다 짜인 설계도는, 아직 살아 있지 않아요. 숨을 불어넣는 건 열람실 쪽(web/federation.ts)의 몫이에요.

inbox/mod.ts는, 동사의 노선도로 읽을 수 있어요. Accept, Follow, Create, Announce, Undo…… 16가지 .on(). 뜻이 여럿인 동사는, 그 자리에서 속을 보고 갈라 보내요 — Undo가 오면 getObject()를 들여다보고, 팔로우 취소인지, 리액션 취소인지, 차단 해제인지 가려내요.

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
