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

사칭과 변조를 막을 수 있어요 — 암호를 한 줄도 쓰지 않고요. 보내는 편지에는 자동으로 봉랍이 찍히고, 도착한 편지는 자동으로 검사돼요. 가짜 발신인의 편지는 코드에 닿기 전에 이 방에서 멈춰요.

현장의 생생함도 한번 보고 가세요. 새 방식(RFC 9421)과 옛 방식(draft-cavage)이 뒤섞인 바다에서, 먼저 아는 방식으로 찍어 보고, 거절당하면 바꿔 쥐고, 통한 쪽을 장부에 적어요(double-knock). 최신 Mastodon이 새 방식에 500을 돌려줘서 폴백을 넓혔다는 FIXME도 붙어 있더라고요. 의전은 교과서보다 현장이 먼저 움직이거든요.

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
