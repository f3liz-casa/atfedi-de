---
name: "論理の神殿"
kind: "数学の隠れ街"
repo: "fedify"
plain: "型チェックが通ることは、小さな証明が通ること——という見方の話です。"
related: [vocab, math-graph]
files:
  - path: "packages/vocab-tools/src/generate.ts"
    what: "型が生まれる現場。仕様→型の写経"
---

TypeScriptの型が祀られている神殿です。[語彙の経蔵](/section/fedify/rooms/vocab/)の一語一語——Note、Follow、Like——は、ここで裏書きされています。

Curry–Howard対応という考え方があります。「型」は「命題」で、「その型の値を作るプログラム」は「その命題の証明」だ、という見方。`Note`型の値を組み立てられた、ということは、「これはNoteの形をしている」という小さな命題に、証明が付いたということです。型検査が通る=神殿の審査が通る。

型は実行時には消えます(type erasure)。神殿は地上に建物を残さない——でも、審査を通った文書だけが船に乗ることで、海の向こうでの事故が減る。数学が工学を支えるやり方として、いちばん静かな形かもしれません。

## 見どころ

- 経蔵の型はActivity Vocabularyの仕様から機械的に写経される——「仕様が型になり、型が検査になる」という写経の連鎖
- 型検査は「その形である」ことしか証明しない。「その内容が正しい」ことは証明しない——神殿の審査にも、管轄がある
- Curry–Howard対応を突き詰めた証明支援系(Lean、Coqなど)では、数学の定理そのものを型検査で確かめる。この神殿の、総本山にあたる

## 経文の一節

{% sutra path="packages/vocab-tools/src/generate.ts" lines="L5-L18" note="経蔵の写経机を、床下から見上げる——仕様が型(命題)になる瞬間" repo="fedify" %}
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
