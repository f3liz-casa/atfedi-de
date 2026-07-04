---
name: "語彙の経蔵"
kind: "fedify 本島"
repo: "fedify"
plain: "連合の世界の共通語——「投稿」「フォロー」「いいね」——の辞書です。"
related: [math-logic, sig, fedify-honden]
files:
  - path: "packages/vocab/src/note.yaml"
    what: "経のもとの一枚。uri、extends、現実の方言入りdefaultContext"
  - path: "packages/vocab/scripts/codegen.ts"
    what: "写経机。ロックと鮮度確認つき"
  - path: "packages/vocab-tools/src/generate.ts"
    what: "generateVocab(): YAMLを読み、クラスを流し書きする"
  - path: "packages/vocab-tools/src/class.ts"
    what: "generateClasses()と型の系図(sortTopologically)"
links:
  - label: "この蔵をGitHubで見る"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/vocab"
---

連合の共通語を、型として話せます。NoteやFollowをふつうのオブジェクトとして組み立てれば、正しいJSON-LDになって海を渡る。綴りを間違えればビルドが教えてくれて、エディタの補完が仕様書の代わりになります。

そしてこの経は、手書きではありません。一語につき一枚のYAMLから、コード生成で書き写されます——写経が、比喩ではなくビルド工程として実在します。辞書にはtoot:やmisskey:といった現実の方言までぜんぶ載っている。連合の言葉は、生きている言葉です。

## 見どころ

- 経のもとは packages/vocab/src/*.yaml。name/uri/extends/defaultContext/propertiesを宣言し、vocab-toolsのschema.yamlで検分される
- 写経机はcodegen.ts——mkdirロックとmtimeの鮮度確認つきで、変わっていなければ焼き直さない
- 生成器の部品はclass.ts/codec.ts/constructor.ts/property.ts。クラスも、encoder/decoderも、cloneも、inspectorも、みんな生成物
- 実行時の台はべつの包み @fedify/vocab-runtime(jsonldを同梱)

## 経文の一節

{% sutra path="packages/vocab-tools/src/generate.ts" lines="L5-L18" note="仕様を読み、型を書き写す——写経の手元" repo="fedify" %}
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

## さわってみる

{% toy id="vocabjson" /%}
