## 로드맵

연합 기능은 하나의 기능이 아니에요 — 단계를 밟아가며 자라나고, 각
단계는 따로따로 확인할 수 있어요. 여기, 이 오르막길 전체를 위에서
내려다볼게요: 여섯 단계마다 fedify가 맡는 부분, 직접 써야 하는 부분,
그리고 실제로 돌려볼 수 있는 체크포인트를 정리했어요. 앞의 세 단계는
가볍고, 진짜 애플리케이션 작업은 네 번째 단계부터 시작돼요.

### 1. [icon:search] 찾아지기

웹 프레임워크에 `createFederation(...)` 호출 하나를 연결하고, 사용자
테이블에서 `Person`을 반환하는 actor dispatcher, 저장된 JWK를 반환하는
key-pairs dispatcher를 준비하면 돼요.

- **fedify가 맡는 부분** — WebFinger, content negotiation, actor
  JSON-LD(`@context`, `publicKey`, `assertionMethod`), NodeInfo 라우팅,
  RSA와 Ed25519 키 생성까지요.
- **직접 써야 하는 부분** — 데이터베이스 조회 하나, 그리고 사용자당 JWK
  두 개를 보관할 자리요.
- **체크포인트** — Mastodon에서 `@you@your.domain`을 검색하면 프로필이
  뜨는지 확인해요. `fedify lookup @you@your.domain`으로도 actor가
  보여요.
- 문서: [tutorial/basics](https://fedify.dev/tutorial/basics) ·
  [manual/actor](https://fedify.dev/manual/actor)

### 2. [icon:user-plus] 팔로우되기

inbox listener를 만들 차례예요 — 첫 `.on(Follow, …)`.

- **fedify가 맡는 부분** — 핸들러 실행 전 서명 검증, 타입이 붙은
  dispatch, `Accept` 서명과 전달까지요.
- **직접 써야 하는 부분** — 팔로워 저장, `Accept` 전송, 그리고 자동
  승인할지 승인 대기로 둘지 정하는 정책 판단이요(`manuallyApprovesFollowers`는
  그저 표시일 뿐, 실제 결정은 코드가 해요).
- **체크포인트** — Mastodon 계정으로 나 자신을 팔로우해 보세요.
  "requested"가 "following"으로 바뀌고, followers collection이 하나로
  늘어나요.
- 문서: [manual/inbox](https://fedify.dev/manual/inbox) ·
  [manual/collections](https://fedify.dev/manual/collections)

### 3. [icon:megaphone] 말하기

처음으로 밖으로 나가는 `Create(Note)`예요.

- **fedify가 맡는 부분** — `sendActivity` 호출 하나로 팔로워 전체에
  fan-out, shared-inbox 중복 제거, backoff를 곁들인 재시도, 전달 순서
  (`orderingKey`), outbox collection 봉투까지요.
- **직접 써야 하는 부분** — 게시물 모델과 그 HTML, 멘션과 해시태그를
  `tag`로 표현하는 부분이요.
- **체크포인트** — 글을 올리면 팔로워의 Mastodon 타임라인에 뜨는지
  확인해요. `fedify inbox`로 임시 팔로워를 만들어두면, 반복 테스트할 때
  거기로 보내보면 돼요.
- 문서: [manual/send](https://fedify.dev/manual/send) ·
  [tutorial/microblog](https://fedify.dev/tutorial/microblog)

### 4. [icon:ear] 듣기 — 진짜 큰 산

네트워크에서 오는 `Create`를 받아 그대로 옮겨오는 일이에요: 원격 actor와
게시물을 데이터베이스 행으로, 타임라인으로, 알림으로.

- **fedify가 맡는 부분** — 어떤 JSON 모양이든 타입이 붙은 객체로
  바꿔주고, document loader, 내장된 객체의 크로스오리진 검증까지요.
- **직접 써야 하는 부분** — 미러링 그 자체예요: `persistActor`,
  `persistPost`, 답글 스레딩, 타임라인 fan-in, 알림. 이건 일부러
  fedify의 일이 아니게 남겨둔 부분이고, 저희가 읽어본 모든 앱에서 연합
  코드 중 가장 큰 덩어리였어요. 시간 대부분을 여기에 써야 해요.
- **체크포인트** — Mastodon에서 단 답글이 내 앱에 나타나고, 맞는 게시물
  아래로 스레딩되고, 맞는 사용자에게 알림이 가는지 봐요.
- 문서: [manual/vocab](https://fedify.dev/manual/vocab) — 직접
  설계하기 전에 [Hackers' Pub](https://github.com/hackers-pub/hackerspub)의
  `persistPost`부터 읽어보세요.

### 5. [icon:repeat] 주고받기

대화를 이루는 동사 다섯 가지예요, 양방향 모두: `Like`, `Announce`,
`Update`, `Delete`, `Undo`.

- **fedify가 맡는 부분** — vocabulary 전체와 전달, 받는 쪽의
  idempotency cache까지요.
- **직접 써야 하는 부분** — upsert에 안전한 상태 전이, 되돌리기
  (`Undo(Like)`가 실제로 좋아요를 지우는지), 그리고 판단이 필요한 삭제
  처리요 — 모더레이션 증거까지 지워버리는 `Delete(Actor)`는 기본값이
  아니라 하나의 결정이에요.
- **체크포인트** — 좋아요와 부스트가 양방향으로 오가는지, 게시물을
  수정하면 Mastodon에도 `Update`가 반영되는지, 삭제하면 거기서도
  사라지는지 확인해요.
- 문서: [manual/pragmatics](https://fedify.dev/manual/pragmatics) — 각
  동사가 Mastodon에서 실제로 어떻게 보이는지 정리돼 있어요.

### 6. [icon:server] 어른 되기

"연합이 된다"에서 "운영이 된다"로 넘어가는 단계예요.

- **fedify가 맡는 부분** — 갈아 끼울 수 있는 메시지 큐, 재시도 정책,
  circuit breaker, 영구 실패 보고, authorized fetch와 instance actor,
  OpenTelemetry 트레이싱까지요.
- **직접 써야 하는 부분** — 워커 프로세스 분리(`manuallyStartQueue` +
  `startQueue`), 실패 정리(404면 정리, `410 Gone`이면 연쇄 삭제),
  모더레이션과 차단 확인, 모니터링 대시보드요.
- **체크포인트** — [manual/deploy](https://fedify.dev/manual/deploy)의
  출시 전 체크리스트를 처음부터 끝까지요.
- 문서: [manual/mq](https://fedify.dev/manual/mq) ·
  [manual/access-control](https://fedify.dev/manual/access-control) ·
  [manual/opentelemetry](https://fedify.dev/manual/opentelemetry)

## [icon:telescope] 전망 — 이 길이 어디까지 이어지는지

여기까지가 전부 마이크로블로그 이야기예요. 같은 여섯 단계가, fedify의
vocabulary와 생태계 지식을 이미 갖춘 채로, 여기까지 뻗어나가요:

- [icon:notebook-pen] **장문 글쓰기** — 여러 언어 콘텐츠와 markdown
  `Source`를 담은 `Article`이에요. Hackers' Pub는 블로그 글 전체를
  그대로 연합해요.
- [icon:braces] **투표** — `Question`, 답글로 표현되는 투표, 마감되면
  `Update`요.
- [icon:heart-handshake] **이모지 반응** — `EmojiReact`와 커스텀
  `Emoji`, Misskey 계열에서 온 기능이에요. Hollo는 둘 다 지원해요.
- [icon:map] **인용 게시물** — FEP-044f `QuoteRequest` /
  `QuoteAuthorization`과 interaction policy요 — 아직은 미개척지예요.
  [기억해 둘 것](/build/fedify/watch-out) 참고하세요.
- [icon:footprints] **계정 이전** — `Move`, 팔로워 이전, alias요. 두
  레퍼런스 코드베이스 모두 지원해요.
- [icon:gavel] **신고** — 서버 간 `Flag`, Mastodon이 기대하는 방식
  그대로요.
- [icon:send] **릴레이** — 구독하고 서빙하고요. CLI의 `fedify relay`와
  [manual/relay](https://fedify.dev/manual/relay)에 나와 있어요.
- [icon:split] **어떤 런타임이든** — Deno, Node, Bun, 십여 개 웹
  프레임워크, 서버리스까지 내려가는 KV·큐 어댑터요.

그리고 이 전망에는 솔직한 경계선도 있어요: 데이터 저장, 타임라인, 알림,
미디어 저장소, 클라이언트 앱과 그 API는 fedify가 절대 손대지 않는
부분이에요 — 그건 애플리케이션이 할 일이에요. 그 경계선은
[내 몫으로 남는 것](/build/fedify/watch-out)에 정확히 그어져 있어요.

## [icon:book-open] 가는 길에 만나는 FEP

FEP — Fediverse Enhancement Proposals — 는 fediverse가 실제로 어떻게
돌아가는지 함께 적어둔 메모예요. 스펙보다 한 단계 느슨하죠. fedify는
그중 상당수를 구현했고,
[FEDERATION.md](https://github.com/fedify-dev/fedify/blob/main/FEDERATION.md)가
그 정식 목록이에요. 이 길에서 실제로 마주치게 될 것들만 짚어볼게요:

- **1단계, 찾아지기** — [FEP-521a](https://w3id.org/fep/521a)(actor가
  공개키를 알리는 방법)와 [FEP-8b32](https://w3id.org/fep/8b32)(Object
  Integrity Proofs — Ed25519 문서 서명) 때문에 fedify가 키 페어를 두
  개씩 보관하게 하는 거예요. [FEP-f1d5](https://w3id.org/fep/f1d5)는
  NodeInfo고요.
- **2단계, 팔로우되기** — [FEP-8fcf](https://w3id.org/fep/8fcf)는 서버
  간 follower collection을 맞춰두고, [FEP-5feb](https://w3id.org/fep/5feb)는
  검색 색인 동의 플래그예요. 예의 있는 서버라면 사용자를 색인하기 전에
  이걸 먼저 확인해요.
- **4단계, 듣기** — [FEP-fe34](https://w3id.org/fep/fe34)는
  [기억해 둘 것](/build/fedify/watch-out)에서 만났던 크로스오리진
  재요청 기본값 뒤에 있는 origin-based 보안 모델이에요.
- **전망 쪽** — 이모지 반응은 [FEP-c0e0](https://w3id.org/fep/c0e0),
  인용 게시물은 [FEP-e232](https://w3id.org/fep/e232)(오브젝트 링크)와
  [FEP-044f](https://w3id.org/fep/044f)(동의를 존중하는 인용)요, 릴레이는
  [FEP-ae0c](https://w3id.org/fep/ae0c), 계정 내보내기는
  [FEP-9091](https://w3id.org/fep/9091) 위에서 돌아가요.
- **그리고 하나 더** — [FEP-67ff](https://w3id.org/fep/67ff)는 간단해요:
  연합 동작을 `FEDERATION.md`에 문서로 남기라는 거예요. fedify도 하나
  갖고 있으니, 서버가 다 자라면 `FEDERATION.md`도 하나 만들어두세요.

---

[icon:arrow-left] [Fedify로 돌아가기](/build/fedify) ·
[icon:arrow-right] [기억해 둘 것](/build/fedify/watch-out)
