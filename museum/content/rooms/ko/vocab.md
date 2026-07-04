---
name: "어휘의 장경각"
kind: "fedify 본섬"
repo: "fedify"
plain: "연합 세계의 공통어 — \"게시\", \"팔로우\", \"좋아요\" — 를 담은 사전이에요."
related: [math-logic, sig, fedify-honden]
files:
  - path: "packages/vocab/src/note.yaml"
    what: "경전 원본 한 장. uri, extends, 현실 사투리가 담긴 defaultContext"
  - path: "packages/vocab/scripts/codegen.ts"
    what: "사경 책상. 잠금과 신선도 확인 딸림"
  - path: "packages/vocab-tools/src/generate.ts"
    what: "generateVocab(): YAML을 읽고 클래스를 흘려 쓰기"
  - path: "packages/vocab-tools/src/class.ts"
    what: "generateClasses()와 타입 계보(sortTopologically)"
links:
  - label: "이 장경각을 GitHub에서 보기"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/vocab"
---

연합의 공통어를 타입으로 말할 수 있어요. Note나 Follow를 평범한 객체로 조립하면 올바른 JSON-LD가 되어 바다를 건너요. 철자를 틀리면 빌드가 알려주고, 에디터의 자동완성이 규격서를 대신해요.

게다가 이 경전은 손으로 쓴 게 아니에요. 한 낱말에 한 장씩 있는 YAML에서 코드 생성으로 옮겨 써요 — 사경이 비유가 아니라 실제 빌드 공정으로 있는 거죠. 사전에는 toot:이나 misskey: 같은 현실 사투리까지 전부 실려 있어요. 연합의 말은 살아 있는 말이에요.

## 볼거리

- 경전 원본은 packages/vocab/src/*.yaml이에요. name/uri/extends/defaultContext/properties를 선언하고, vocab-tools의 schema.yaml이 검사해요
- 사경 책상은 codegen.ts예요 — mkdir 잠금과 mtime 신선도 확인이 붙어 있어서, 바뀌지 않았으면 다시 굽지 않아요
- 생성기의 부품은 class.ts/codec.ts/constructor.ts/property.ts예요. 클래스도, encoder/decoder도, clone도, inspector도, 모두 만들어진 결과물이죠
- 실행 시점의 받침대는 다른 꾸러미 @fedify/vocab-runtime이에요(jsonld를 함께 넣어요)

## 경문 한 구절

{% sutra path="packages/vocab-tools/src/generate.ts" lines="L5-L18" note="규격을 읽고 타입을 옮겨 써요 — 사경하는 손끝" repo="fedify" %}
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

## 만져 보기

{% toy id="vocabjson" /%}
