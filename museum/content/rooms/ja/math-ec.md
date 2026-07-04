---
name: "楕円曲線の工房"
kind: "数学の隠れ街"
repo: "fedify"
plain: "署名(なりすまし防止の判子)の中身が、実は曲線の上の計算だ、という話です。"
related: [sig, math-prime, math-hash]
files:
  - path: "packages/fedify/src/sig/proof.ts"
    what: "床上の現場。createProof/verifyProof"
links:
  - label: "FEP-8b32: Object Integrity Proofs"
    href: "https://codeberg.org/fediverse/fep/src/branch/main/fep/8b32/fep-8b32.md"
---

Ed25519という署名方式の、床下の工房です。地上の[儀典の間](/ja/section/fedify/rooms/sig/)で「Object Integrity Proof(FEP-8b32)」と呼ばれている印鑑は、ここで捺されています。

仕組みの芯は、Curve25519という一本の曲線の上での「点の足し算」です。曲線上の点と点を、決められた作法で足すと、また曲線上の点になる。この足し算を何億回重ねた結果から、元の回数を逆算することは、いまの数学では事実上できません。秘密鍵は「何回足したか」、公開鍵は「足した結果の点」。逆算できないから、印鑑は偽造できない——それだけの、うつくしい仕掛けです。

地上の工学は、この工房を知らなくても回ります。WebCrypto APIが一行で署名を返してくれるので。でも、レンズをかけてここに降りてくると、「なぜ偽造できないと言い切れるのか」の根っこに触れられます。

## 見どころ

- 鍵の長さはたった32バイト。RSAの鍵(数百バイト)よりずっと短いのに、同等以上の強さを持つ
- 「離散対数問題が難しい」という一点に、安全性のぜんぶが乗っている
- Ed25519は決定的署名——同じ文書には毎回同じ署名が出る。乱数のくじ引きに失敗して秘密が漏れる、という古典的事故が構造的に起きない

## 経文の一節

{% sutra path="packages/fedify/src/sig/proof.ts" lines="L179-L190" note="儀典の間と同じ現場を、床下から見る。外部ライブラリなし、Web Cryptoの\"Ed25519\"一語に曲線がぜんぶ畳まれている" repo="fedify" %}
```typescript
  const proofCanon = serialize(proofConfig);
  const proofBytes = encoder.encode(proofCanon);
  const proofDigest = await crypto.subtle.digest("SHA-256", proofBytes);
  const digest = new Uint8Array(proofDigest.byteLength + msgDigest.byteLength);
  digest.set(new Uint8Array(proofDigest), 0);
  digest.set(new Uint8Array(msgDigest), proofDigest.byteLength);
  const sig = await crypto.subtle.sign("Ed25519", privateKey, digest);
```
{% /sutra %}

## さわってみる

{% toy id="eccurve" /%}
