---
name: "素数の井戸"
kind: "数学の隠れ街"
repo: "fedify"
plain: "古いほうの判子(RSA)の中身は、大きな素数の掛け算だ、という話です。"
related: [math-ec, sig]
files:
  - path: "packages/fedify/src/sig/key.ts"
    what: "井戸掘りの現場。RSA-4096とEd25519の二対"
---

RSAの井戸です。楕円曲線の工房より古くからある、石積みの井戸。フェディバースの旧い作法(draft-cavageのHTTP署名)は、いまもこの井戸の水を使っています。だからfedifyはRSA鍵とEd25519鍵の両方を持ち歩きます——新しい町と、古い町の、両方と話すために。

原理は一行で言えます。大きな素数を二つ選んで掛けるのは一瞬。その積だけを見せられて、元の二つに割り戻すのは、桁が十分大きければ千年がかり。掛け算は坂道を下ること、素因数分解は登ること。井戸は、落ちるのは簡単で、登るのが難しい。

## 見どころ

- Mastodon互換の世界では、actorの公開鍵は`publicKeyPem`としてプロフィールに貼り出される——井戸の場所は公開情報で、秘密は「二つの素数」だけ
- 鍵長2048ビットが現在の標準。曲線の32バイトと比べると、同じ強さのためにずいぶん大きな石が要る
- 量子計算機が実用になると、この井戸は(楕円曲線の工房ともども)埋め立てが決まっている。後継の井戸(耐量子暗号)の設計はもう始まっている
- fedifyのgenerateCryptoKeyPairの既定はRSASSA-PKCS1-v1_5、modulusLength 4096——標準の2048より太い石で積んである

## 経文の一節

{% sutra path="packages/fedify/src/sig/key.ts" lines="L85-L100" note="古い井戸(RSA-4096)と新しい工房(Ed25519)が、同じ蛇口から出てくる" repo="fedify" %}
```typescript
  if (algorithm == null || algorithm === "RSASSA-PKCS1-v1_5") {
    return crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"],
    );
  } else if (algorithm === "Ed25519") {
    return crypto.subtle.generateKey(
      "Ed25519",
      true,
      ["sign", "verify"],
```
{% /sutra %}

## さわってみる

{% toy id="prime" /%}
