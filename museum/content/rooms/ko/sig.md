---
name: "의전의 방"
kind: "fedify 본섬"
repo: fedify
plain: "편지의 봉랍. \"정말 본인이 보냈는지\", \"오는 길에 바뀌지 않았는지\"를 확인하는 방이에요."
related: [fedify-honden, math-ec, math-hash, math-graph, math-prime]
files:
  - path: packages/fedify/src/sig/http.ts
    what: "RFC 9421+draft-cavage, double-knock과 상대마다 학습"
  - path: packages/fedify/src/sig/proof.ts
    what: "FEP-8b32 Object Integrity Proofs(eddsa-jcs-2022)"
  - path: packages/fedify/src/sig/ld.ts
    what: "옛 방식 RsaSignature2017(URDNA2015 정준화 사용)"
  - path: packages/fedify/src/sig/key.ts
    what: "키 생성과 가져오기(RSA-4096 / Ed25519)"
links:
  - label: "이 방을 GitHub에서 보기"
    href: https://github.com/fedify-dev/fedify/tree/main/packages/fedify/src/sig
---

문서에 도장을 찍고, 도착한 도장을 검사하는 방이에요. 세 가지 방식이 함께 살아요 — HTTP Message Signatures(새 RFC 9421과 옛 draft-cavage 양손잡이, http.ts 2100줄), 옛 방식 LD 서명 RsaSignature2017(ld.ts), 그리고 새로운 FEP-8b32 Object Integrity Proofs(proof.ts, Ed25519)예요.

double-knock(두 번 두드리기)은 이 방의 간판 재주예요. 먼저 장부에 기억해 둔 방식으로 찍어 보고, 400이나 401로 돌아오면 다른 쪽으로 바꿔 쥐고, 통한 쪽을 장부에 적어 둬요. 코드에는 지금 생생한 FIXME도 붙어 있어요 — 최신 Mastodon이 RFC 9421 서명에 500을 돌려줘서, 5xx에도 바꿔 쥐도록 했다는 거죠. 의전은 교과서보다 현장이 먼저 움직이더라고요.

## 볼거리

- createProof(proof.ts)는 JCS로 다시 늘어놓고 → SHA-256으로 그림자를 뜨고 → proof의 그림자와 본문의 그림자를 이어 64바이트로 만들고 → Ed25519로 찍어요. Ed25519 말고 다른 키는 문전박대예요
- verifyProofInternal은 기억하던 키가 Ed25519가 아니면 다시 받아와서 자기 자신을 재귀 호출해요(proof를 다시 벗겨내지 않으려고요)
- RFC 9421 §5의 Accept-Signature 챌린지에도 응해요 — "이 방식으로 다시 찍어 줘"라는 말을 들으면 한 번에 응해요
- key.ts의 generateCryptoKeyPair는 RSA-4096과 Ed25519 두 쌍이에요. 전부 Web Crypto(crypto.subtle)로 하고, 바깥 암호 라이브러리는 없어요

## 경문 한 구절

{% sutra path="packages/fedify/src/sig/proof.ts" lines="L179-L190" note="다시 늘어놓고, 그림자로 만들고, 잇고, 찍어요" repo="fedify" %}
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

## 만져 보기

{% toy id="ed25519" /%}
