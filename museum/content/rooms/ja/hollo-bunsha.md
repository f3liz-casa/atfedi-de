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

npmの蔵版から写経されたfedifyが、ここに納まっています。package.jsonには@fedify/\*の経が八巻——fedify本体、honoの橋、postgresの倉、vocab、webfinger、debugger、markdown-itの小径が二本——ぜんぶ ^2.3.0 で揃い踏み。

別院と館の接合は、たった一行です。`src/index.tsx` の `app.use(federation(fedi, ...))`。しかもpages/oauth/apiのルータより前に置かれているので、`/@handle` という同じ住所が、訪ね方(Acceptヘッダ)によってfedifyの顔にも客間の顔にもなります。別院は目立たないのに、館の玄関の作法はぜんぶ別院が決めている。

ところで、この館の表札(packageのname)は `@fedify/hollo`。holloはいま、fedify-devの家の一員です。別院と総本山が、同じ苗字を名乗っている。

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
