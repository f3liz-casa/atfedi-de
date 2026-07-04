---
name: 儀典の間
kind: fedify 本島
repo: fedify
plain: 手紙の封蝋。「ほんとうに本人が出したか」「途中で書き換えられていないか」を確かめる部屋です。
related: [fedify-honden, math-ec, math-hash, math-graph, math-prime]
files:
  - path: packages/fedify/src/sig/http.ts
    what: RFC 9421+draft-cavage、double-knockと相手ごとの学習
  - path: packages/fedify/src/sig/proof.ts
    what: FEP-8b32 Object Integrity Proofs(eddsa-jcs-2022)
  - path: packages/fedify/src/sig/ld.ts
    what: 旧式のRsaSignature2017(URDNA2015正準化を使う)
  - path: packages/fedify/src/sig/key.ts
    what: 鍵の生成と取り寄せ(RSA-4096 / Ed25519)
links:
  - label: この間をGitHubで見る
    href: https://github.com/fedify-dev/fedify/tree/main/packages/fedify/src/sig
---

文書に印を捺し、届いた印を検める部屋です。三つの作法が同居しています——HTTP Message Signatures(新しいRFC 9421と旧いdraft-cavageの両刀、http.ts 2100行)、旧式のLD署名 RsaSignature2017(ld.ts)、そして新しいFEP-8b32 Object Integrity Proofs(proof.ts、Ed25519)。

double-knock(二度たたき)は、この部屋の看板芸です。まず帳面に覚えのある作法で捺してみて、400や401で返されたらもう一方に持ち替え、通ったほうを帳面に書き足す。コードにはいま、生々しいFIXMEも貼ってあります——最先端のMastodonがRFC 9421署名に500を返すので、5xxでも持ち替えるようにした、という。儀典は、教科書より現場が先に動く。

## 見どころ

- createProof(proof.ts)は、JCSで並べ直し→SHA-256で影→proofの影と本文の影を継いで64バイト→Ed25519で捺す。Ed25519以外の鍵は門前払い
- verifyProofInternalは、覚えていた鍵がEd25519でなかったら取り寄せ直して自分自身に再帰する(proofを剥がし直さないため)
- RFC 9421 §5のAccept-Signatureチャレンジにも応える——「この作法で捺し直して」と言われたら、一度で応じる
- key.tsのgenerateCryptoKeyPairはRSA-4096とEd25519の二対。ぜんぶWeb Crypto(crypto.subtle)で、外部の暗号ライブラリなし

## 経文の一節

{% sutra path="packages/fedify/src/sig/proof.ts" lines="L179-L190" note="並べ直して、影にして、継いで、捺す" repo="fedify" %}
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

{% toy id="ed25519" /%}
