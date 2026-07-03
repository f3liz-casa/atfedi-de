## 실제로 써보면 어떨까

fedify를 제대로 보는 가장 좋은 방법은, fedify를 만든 사람이 직접 쓴
실전 코드베이스 두 개를 읽는 거예요: 1인용 마이크로블로그
[Hollo](https://github.com/fedify-dev/hollo)와, 여러 사용자가 쓰는
블로그 플랫폼 [Hackers' Pub](https://github.com/hackers-pub/hackerspub)이요.
둘 다에서 이런 게 보여요:

**연합 기능의 핵심 전체가 옵션 객체 하나예요**. Hollo의
`createFederation` 호출은 — KV store, 재시도하는 Postgres 큐, 서명
협상, SSRF 정책, 트레이싱까지 담아서 — 스무 줄 남짓이에요
(`src/federation/federation.ts`). 직접 손으로 짰다면 전달 파이프라인,
서명 레이어, 키 캐시까지 전부 손수 관리해야 했을 거예요.

**inbox는 라우팅 테이블이에요**. Hollo는 activity 타입 열다섯 개를
`.on(Follow, …).on(Create, …)` 여든 줄 정도로 연결해요. 핸들러가
실행될 때쯤엔, fedify가 이미 HTTP 서명을 검증하고 타입 붙은 객체까지
건네준 뒤예요. Hollo 전체에서 서명 관련 코드는 딱 하나, fedify가 이미
해준 검증을 *일부러 건너뛰는* 작은 hook뿐이에요 — tombstone된 actor를
다루는 특수한 경우 하나 때문에요.

**actor는 데이터베이스 조회예요**. DB 행으로 만든 `Person`만 돌려주면,
content negotiation, WebFinger, NodeInfo 라우팅, JSON-LD `@context` /
`publicKey` / `assertionMethod` 블록까지는 fedify가 알아서 해요.
key-pairs dispatcher는 그냥 저장된 JWK를 돌려주기만 하면 되고요 —
RSA와 Ed25519를 둘 다 공개해서 상대 서버에 맞는 걸 골라 쓰는 것도
fedify가 해요.

**팔로워 전체에게 전달하는 것도 호출 한 번이에요**.
`ctx.sendActivity(user, "followers", activity, { preferSharedInbox: true })`.
두 앱 모두 inbox 목록을 나열하지도, shared inbox 중복을 걸러내지도,
재시도·backoff 코드를 짜지도 않아요. 순서 보장은 분산 시스템 설계
문제가 아니라 옵션 하나(`orderingKey`)로 끝나요.

**collection은 커서 컨벤션이에요**. followers collection은 마흔 줄
정도예요: `{ items, nextCursor }`를 돌려주는 windowed SQL 쿼리 하나면
돼요. `OrderedCollection` 페이지, `next`, `totalItems`는 fedify가
만들어줘요.

---

[icon:arrow-left] [Fedify로 돌아가기](/build/fedify) ·
[icon:arrow-right] [기억해 둘 것](/build/fedify/watch-out)
