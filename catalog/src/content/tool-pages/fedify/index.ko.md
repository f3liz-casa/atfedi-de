## Fedify

ActivityPub 서버를 만들 때 쓰는 TypeScript 프레임워크예요. 연합 처리의
번거로운 부분을 대신 맡아 줘요.

[icon:scale] MIT · [icon:code] TypeScript · [icon:house] [fedify.dev](https://fedify.dev) · [icon:git-branch] [저장소](https://github.com/fedify-dev/fedify)

### 존재 이유

실제 현장에서 ActivityPub를 쓴다는 건, 서명 방식만 네 가지(HTTP 요청용
둘, 문서용 둘)를 다뤄야 한다는 뜻이에요. 서버마다 JSON 모양이 조금씩
다르고, 전달은 순서 없이 도착하고, 스펙에는 나오지 않는 서버별
특이사항까지 챙겨야 하죠. fedify는 이 모든 번거로움을 기본값으로
바꿔줘요 — fedify를 만든 사람이 직접 쓴 현장 가이드도 있어요:
[Why ActivityPub is hard](https://hackers.pub/@fedify/2026/why-activitypub-is-hard).

### 잘 맞는 경우

- [icon:rocket] **TypeScript나 JavaScript로 새 연합 앱을 만드는 경우** —
  fedify가 가장 강력하게 작동해요. Ghost, Hollo, Hackers' Pub가 실제로
  쓰고 있어요.
- [icon:puzzle] **이미 있는 앱에 연합 기능만 얹고 싶은 경우** — Express,
  Hono, Next.js, SvelteKit 등 십여 개 프레임워크 연동을 지원해요.
- [icon:braces] **JSON-LD를 손으로 짜는 데 지친 사람** — 타입이 붙은
  vocabulary만으로도 쓸 가치가 있어요.
- [icon:book-open] **다른 언어로 구현하는 사람** — 출력이 결정적이라(같은
  입력이면 언제나 같은 결과가 나와요), 바이트 단위로 맞는 정답지가
  되어줘요.

### 좋은 점

- [icon:sliders-horizontal] 연합 기능의 핵심 전체가 **옵션 객체 하나**예요
  — Hollo에서는 스무 줄 남짓이에요.
- [icon:inbox] inbox는 **라우팅 테이블 하나**예요 — 핸들러가 실행되기 전에
  서명 검증이 이미 끝나 있어요.
- [icon:user-round] actor는 **데이터베이스 조회 하나**예요 — WebFinger,
  NodeInfo, 키 공개까지 따라와요.
- [icon:send] 팔로워 전체에게 전달하는 것도 **호출 한 번**이에요 —
  fan-out, 재시도, 순서 보장까지 포함돼요.

:::card
[icon:heart-handshake] [실제로 써보면 어떨까](/build/fedify/feels-good) — Hollo와 Hackers' Pub 코드로 증명해요
:::

### 가는 길

연합 기능은 단계별로 자라나요. 각 단계는 다음으로 넘어가기 전에 확인할 수
있어요: 찾아지기 → 팔로우되기 → 말하기 → 듣기 → 주고받기 → 어른 되기.
앞의 세 단계는 가볍고, 진짜 작업은 네 번째 단계부터 시작돼요.

:::card
[icon:milestone] [로드맵](/build/fedify/roadmap) — 여섯 단계와 체크포인트, 그리고 이 길이 어디까지 이어지는지 볼 수 있어요
:::

### 기억해 둘 것

- [icon:database] **데이터 저장은 직접 해야 해요** — fedify는 아무것도
  저장하지 않아요. 원격 actor와 게시물을 그대로 옮겨와 저장하는 게 진짜
  일이에요.
- [icon:gavel] **정책 결정도 직접 해야 해요** — 팔로우 승인, 모더레이션,
  삭제 처리까지 다요.
- [icon:triangle-alert] **날카로운 함정도 있어요** — 불변 vocab, `Object`
  이름 충돌, 크로스오리진 재요청, 두 가지 키 타입.

:::card
[icon:triangle-alert] [기억해 둘 것](/build/fedify/watch-out) — 여러 함정과 그게 어디에 적혀 있는지 정리했어요
:::

### 운영하기

- [icon:split] 웹 프로세스와 워커 프로세스 분리
- [icon:shield-check] 안전장치는 그대로 두기
- [icon:terminal] CLI로 디버깅, 에디터에서 린트

:::card
[icon:wrench] [운영하기](/build/fedify/running) — 운영, 디버깅, 그리고 시작점까지 한눈에 볼 수 있어요
:::

### 더 보기

:::cards
- [icon:map] **Why ActivityPub is hard** — fedify가 무엇을 대신 해주는지, 만든 사람이 직접 쓴 현장 가이드예요 — [hackers.pub](https://hackers.pub/@fedify/2026/why-activitypub-is-hard)
- [icon:git-branch] **코드 읽기** — 저녁 한나절 읽어볼 만한 실전 fedify 코드베이스예요 — [Hollo](https://github.com/fedify-dev/hollo) [Hackers' Pub](https://github.com/hackers-pub/hackerspub)
- [icon:notebook-pen] **fedify를 쓰다가 졸업한 이야기** — 실전에서 fedify를 운영하다 결국 벗어나기까지의 현장 기록이에요 — [blog.atfedi.de](https://blog.atfedi.de/ko/leaving-fedify)
:::
