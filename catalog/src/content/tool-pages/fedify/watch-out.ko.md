## 기억해 둘 것

두 가지 목록이에요: fedify가 일부러 남겨둔 몫, 그리고 저희가 직접
부딪힌 날카로운 함정들 — 어디에 적혀 있는지도 같이 짚어둘게요.

### 설계상 내 몫인 일

fedify는 애플리케이션이 아니라 프로토콜 계층이에요. Hollo와 Hackers'
Pub를 나란히 읽어보면, 앱의 진짜 일이 어디서부터 시작되는지 정확히
같은 지점을 가리켜요:

**데이터 저장**. fedify는 vocab 객체만 건네줄 뿐, 아무것도 저장하지
않아요. 원격 actor와 게시물을 내 데이터베이스로 그대로 옮겨오는 일이
Hackers' Pub에서 연합 코드 중 가장 큰 덩어리예요(`persistActor`,
`persistPost` — 신중하게 짠 upsert만 수천 줄이에요). 처음부터 시간을
넉넉히 잡아두세요.

**정책**. `manuallyApprovesFollowers`는 자물쇠 아이콘만 바꿔줄
뿐이에요. Follow를 자동으로 `Accept`할지는 inbox handler가 직접
정해야 해요([manual/pragmatics](https://fedify.dev/manual/pragmatics)).
모더레이션도 마찬가지예요 — 원격 actor를 실제로 조회하기 *전에* 자기
차단 목록부터 확인해야 해요. `Delete(Actor)`를 그대로 받아들이기
전에도 한 번 더 생각해야 하고요 — Hackers' Pub는 제재받은 actor를
일부러 남겨둬요. 그래야 원격 actor가 스스로 삭제하는 것만으로
모더레이션 증거를 지워버릴 수 없거든요.

**부수 효과**. 알림, 타임라인, 카운터 — 전부 핸들러 안에서 앱이 직접
fan-out해야 해요. fedify에는 수신용 idempotency cache가
있지만([manual/inbox](https://fedify.dev/manual/inbox#activity-idempotency)),
두 앱 모두 그 위에 얹어서 데이터베이스 쓰기 자체도 upsert에 안전하게
만들어뒀어요.

**실패 정리**. fedify는 재시도하다가 영구 전달 실패를 보고만 해줘요.
그게 무슨 뜻인지 정하는 건 — 404면 팔로우를 정리하고, `410 Gone`이면
계정을 지우고 연쇄 삭제하고 — `setOutboxPermanentFailureHandler`의
몫이에요([manual/send](https://fedify.dev/manual/send#error-handling)).

### 날카로운 함정과 적혀 있는 곳

두 코드베이스를 읽으며(그리고 직접 몇 개는 부딪히며) 찾아낸 함정들이에요.
경고가 적힌 페이지도 같이 짚어둘게요:

**`Object`와 `Image`가 JS 내장 객체 이름과 겹쳐요**. 별칭을 붙여서
import하세요(`Object as ASObject`) — 안 그러면 오후 반나절이 그냥
날아가요. [manual/vocab](https://fedify.dev/manual/vocab) 맨 위에
경고가 있고, 두 코드베이스에도 그대로 보여요.

**vocab 객체는 불변이에요**. 만든 뒤에는 속성을 다시 대입할 수 없어요
— `.clone({ … })`으로 새로 만들어야 해요.
[manual/vocab § Immutability](https://fedify.dev/manual/vocab#immutability).

**크로스오리진으로 내장된 객체는 기본적으로 다시 가져와요**.
안전하지만, 부스트나 인용 하나마다 왕복이 한 번씩 더 들고, origin
서버가 죽어 있으면 실패해요. Hollo는 activity 서명이 이미 내용을
보증해주는 열몇 군데에서 `crossOrigin: "trust"`를 넘겨요. 이
trade-off는 [manual/vocab § Origin-based security model](https://fedify.dev/manual/vocab#origin-based-security-model)에
정리돼 있어요.

**activity `id`를 `(actor, object)`에서 유도하지 마세요**. Follow →
Undo → Follow는 서로 다른 activity 세 개예요 — UUID를 박아 넣어야
해요. [manual/send § Specifying an activity](https://fedify.dev/manual/send#specifying-an-activity).

**키 타입은 두 가지 다 만드세요**. Mastodon은 RSA HTTP 서명만
검증해요. Ed25519는 Object Integrity Proofs용이고요.
[manual/actor § Public keys](https://fedify.dev/manual/actor#public-keys-of-an-actor).

**서명 협상은 지금도 살아있는 호환성 손잡이예요**. Hollo와 Hackers'
Pub 둘 다 특정 상대 구현과 호환을 맞추려고
`firstKnock: "draft-cavage-http-signatures-12"`로 고정해뒀어요.
나중에 되돌리자는 TODO도 남겨둔 채로요. 특정 서버로만 연합이 안 될 땐
이 손잡이부터 먼저 확인해보세요. 옵션은
[manual/federation](https://fedify.dev/manual/federation)에 있어요.

**인용 게시물은 아직 미개척지예요**. fedify가 FEP-044f vocabulary
(`QuoteRequest`, `QuoteAuthorization`, interaction policy)는
챙겨주지만, 인용을 못 그리는 서버를 위한 `RE: <url>` 인라인 HTML
fallback은 두 앱 다 손수 만들었어요. Hackers' Pub는 받을 때 Misskey의
인라인 인용 마크업까지 따로 벗겨내고요. 이건 매뉴얼에 *없어요* —
Hackers' Pub의 `federation/inbox/quote.ts`와 `models/html.ts`를 직접
읽어보세요.

**큐의 handler timeout이 핸들러를 실제로 죽이지는 않아요**. 느린 원격
fetch는 timeout이 지나도 계속 살아남아서, 데이터베이스 연결을 붙든
채로 있을 수 있어요. Hackers' Pub는 persistence 재귀 전체에 자체
`AbortSignal` 예산을 심어서 모든 원격 fetch에 한계를 걸어둬요. 이것도
매뉴얼엔 없고 — Hackers' Pub의 `models/post.ts`에 있는 긴 주석이 가장
잘 정리한 설명이에요.

---

[icon:arrow-left] [Fedify로 돌아가기](/build/fedify) ·
[icon:arrow-right] [운영하기](/build/fedify/running)
