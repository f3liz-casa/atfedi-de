## 운영하기

fedify 앱을 "연합은 되는 상태"에서 "실전 운영 상태"로 끌어올리는
습관들이에요 — 관련 매뉴얼 페이지도 같이 짚어둘게요.

**웹과 워커를 나누세요**. HTTP는 한 프로세스에서, 큐는
`manuallyStartQueue` + `startQueue`로 다른 프로세스에서 돌리세요.
Hollo와 Hackers' Pub 둘 다, 느린 연합 작업이 사용자 요청까지 느리게
만든 뒤에 이 구조로 수렴했어요. [manual/mq](https://fedify.dev/manual/mq) ·
[manual/deploy](https://fedify.dev/manual/deploy).

**프록시 뒤에 있다면 origin을 고정하세요**. `origin` 옵션(또는
`x-forwarded-fetch` 미들웨어)을 설정해서, 서명 검증이 내부에서 바뀐
Host가 아니라 공개 URL 기준으로 이뤄지게 하세요.
[manual/federation](https://fedify.dev/manual/federation).

**안전장치는 그대로 두세요**. 서명 검증은 기본으로 켜져
있고([manual/inbox](https://fedify.dev/manual/inbox#signature-verification)),
document loader는 사설 주소를 기본으로 거부해요
([manual/federation § allowPrivateAddress](https://fedify.dev/manual/federation#allowprivateaddress)).
둘 다 "돌아가는 것처럼 보인다"와 "안전하다" 사이의 경계선이에요 —
풀어두는 건 테스트할 때뿐이어야 해요([manual/test](https://fedify.dev/manual/test)).

**디버깅은 CLI로, lint는 에디터에서**. `fedify lookup`으로 아무 원격
객체나 들여다보고, `fedify inbox`로 임시 inbox를 만들고, `fedify
tunnel`로 개발 서버를 HTTPS로 열 수 있어요([CLI reference](https://fedify.dev/cli)).
`@fedify/lint` 플러그인은 타이핑하는 동안 바로 interop 실수를
잡아줘요 — 키 페어 누락, 절대 전달되지 않는 outbox listener 같은
것들이요([manual/lint](https://fedify.dev/manual/lint)). 그리고 팀이
직접 만드는 ActivityPub 전용 디버거 [DrFed](https://drfed.org/)도
준비 중이에요.

**API reference 말고 튜토리얼부터 시작하세요**.
[기본 튜토리얼](https://fedify.dev/tutorial/basics)과
[연합 마이크로블로그 튜토리얼](https://fedify.dev/tutorial/microblog)이
전체 흐름을 처음부터 끝까지 안내해줘요. 에디터의 AI가 대신 읽어야
한다면 [llms.txt](https://fedify.dev/llms.txt)도 있어요.

---

[icon:arrow-left] [Fedify로 돌아가기](/build/fedify)
