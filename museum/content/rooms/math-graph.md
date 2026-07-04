---
name: "グラフの書庫"
kind: "数学の隠れ街"
repo: "fedify"
plain: "「書き方が違うだけで意味は同じ」文書を、同じ形に揃えなおす話です。"
related: [math-hash, vocab, sig]
files:
  - path: "packages/fedify/src/sig/ld.ts"
    what: "書庫の現場。jsonld.canonize(URDNA2015)"
links:
  - label: "RDF Dataset Canonicalization (W3C)"
    href: "https://www.w3.org/TR/rdf-canon/"
---

JSON-LDの正準化(canonicalization)という、地味な顔をした深い問題の書庫です。

同じ意味の文書は、いくらでも違う書き方ができます。鍵の順番を入れ替えても、省略記法を使っても、意味は同じ。でも署名は「バイト列」に捺すものなので、書き方が揺れると検印が合わなくなる。そこで、意味(RDFグラフ)が同じなら必ず同じバイト列になるように文書を並べ直してから署名する——それが正準化で、RDFC-1.0(旧称URDNA2015)というアルゴリズムが担います。

「同じグラフか」を決める問題はグラフ同型判定という、計算量理論でも据わりの悪い名物問題の親戚です。空白ノードに正準な名前を振る作業は、その難しさと隣り合わせに設計されています。ふだん誰も見ない床下に、こんな大物が住んでいる。

## 見どころ

- この書庫(URDNA2015)を通るのは、旧いLD署名(RsaSignature2017)。新しいFEP-8b32はもっと軽い並べ直し——JCS(RFC 8785、鍵を辞書順に並べるだけ)——で済ませる。強い道具ほど重い、という床下の経済
- HTTP署名(封筒の印)はそもそも並べ直しをせず、影(digest)に捺す。三つの儀典が、三つの違う深さでこの問題と付き合っている
- 同じ意味・違う書き方の文書が同じ影になる——扉(SHA-256)の手前に、この書庫の並べ直しが挟まる
- 仕様はW3Cの「RDF Dataset Canonicalization」。2024年に正式勧告になった、わりと若い正典

## 経文の一節

{% sutra path="packages/fedify/src/sig/ld.ts" lines="L1207-L1218" note="並べ直して(canonize)から、影(SHA-256)にする" repo="fedify" %}
```typescript
async function hashJsonLd(
  jsonLd: unknown,
  contextLoader: DocumentLoader | undefined,
): Promise<string> {
  const canon = await jsonld.canonize(jsonLd, {
    format: "application/n-quads",
    documentLoader: contextLoader ?? getDocumentLoader(),
  });
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(canon));
  return encodeHex(hash);
}
```
{% /sutra %}

## さわってみる

{% toy id="canon" /%}
