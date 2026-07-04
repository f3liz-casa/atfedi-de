---
name: fedify 別院(npm蔵版)
kind: hollo 境内・別院
repo: hollo
plain: holloの中に入っている、fedifyライブラリそのもの(npmから入れた写し)です。
related: [sig, fedify-honden]
files:
  - path: package.json
    what: '@fedify/*の八巻、ぜんぶ^2.3.0'
  - path: src/index.tsx
    what: federation()ミドルウェア一行の渡り廊下
  - path: src/federation/federation.ts
    what: 館にひとつのcreateFederation()
links:
  - label: 総本山(fedify本島)へ
    href: https://github.com/fedify-dev/fedify
  - label: npm蔵版の目録
    href: https://www.npmjs.com/package/@fedify/fedify
---

`npm install` ひとつで、この館の外交がぜんぶ手に入りました——それがこの塔です。package.jsonに@fedify/\*の経が八巻、揃い踏み。

別院と館の接合は、たった一行です。`app.use(federation(fedi, ...))`。しかもルータたちより前に立つので、`/@handle` という同じ住所が、訪ね方によってfedifyの顔にも客間の顔にもなります。ところで、この館の表札は `@fedify/hollo`——別院と総本山が、同じ苗字を名乗っています。

## 見どころ

- createFederation()は館でただ一度(`src/federation/federation.ts`)。あとは全員が同じインスタンスを回し読みする
- @fedify/vocabの語彙(Accept/Announce/Create/EmojiReact/Follow/Like/Move/QuoteRequest……)が、コードのあちこちで直接importされている
- 検索(v2 search)も、lookupObject/isActorを@fedify/vocab経由で使う

## 経文の一節

{% sutra path="src/index.tsx" lines="L69-L76" note="この一行が、別院と館の渡り廊下。ルータたちより先に立つ" repo="hollo" %}
```typescript
app.use(federation(fedi, (_) => undefined));

app.route("/", pages);
app.route("/oauth", oauth);
app.route("/api", api);
app.route("/image", image);
app.route("/proxy", proxy);
```
{% /sutra %}
