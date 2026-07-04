---
name: "논리의 신전"
kind: "수학의 숨은 거리"
repo: "fedify"
plain: "타입 검사를 통과하는 건 작은 증명이 통과하는 것 — 이라는 관점의 이야기예요."
related: [vocab, math-graph]
files:
  - path: "packages/vocab-tools/src/generate.ts"
    what: "타입이 태어나는 현장. 명세 → 타입 사경"
---

TypeScript 타입이 모셔져 있는 신전이에요. [어휘의 장경각](/ko/section/fedify/rooms/vocab/)의 한 낱말 한 낱말 — Note, Follow, Like — 을 여기가 뒷받침해요.

커리–하워드 대응이라는 생각이 있어요. "타입"은 "명제"이고, "그 타입의 값을 만드는 프로그램"은 "그 명제의 증명"이다, 라는 관점이에요. `Note` 타입의 값을 짜 맞출 수 있었다는 건, "이건 Note의 모양을 하고 있다"라는 작은 명제에 증명이 붙었다는 뜻이에요. 타입 검사를 통과한다 = 신전의 심사를 통과한다.

타입은 실행 시점에는 사라져요(type erasure). 신전은 땅 위에 건물을 남기지 않아요 — 하지만 심사를 통과한 문서만 배에 오르니까, 바다 건너편에서 생기는 사고가 줄어요. 수학이 공학을 떠받치는 방식 중에서, 가장 조용한 모습일지도 몰라요.

## 볼거리

- 장경각의 타입은 Activity Vocabulary 명세에서 기계적으로 사경돼요 — "명세가 타입이 되고, 타입이 검사가 된다"라는 사경의 사슬이죠
- 타입 검사는 "그 모양이다"라는 것만 증명해요. "그 내용이 옳다"라는 건 증명하지 않아요 — 신전의 심사에도 관할이 있는 거죠
- 커리–하워드 대응을 끝까지 밀어붙인 증명 보조 시스템(Lean, Coq 등)에서는, 수학 정리 그 자체를 타입 검사로 확인해요. 이 신전의 총본산에 해당하죠

## 경문 한 구절

{% sutra path="packages/vocab-tools/src/generate.ts" lines="L5-L18" note="장경각의 사경 책상을, 마루 밑에서 올려다봐요 — 명세가 타입(명제)이 되는 순간" repo="fedify" %}
```typescript
export default async function generateVocab(
  schemaDir: string,
  generatedPath: string,
): Promise<void> {
  const types = await loadSchemaFiles(schemaDir);
  const encoder = new TextEncoder();

  const file = await open(generatedPath, "w");
  const writer = file.createWriteStream();

  for await (const code of generateClasses(types)) {
    writer.write(encoder.encode(code));
  }
```
{% /sutra %}
