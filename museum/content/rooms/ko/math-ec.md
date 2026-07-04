---
name: "타원곡선 공방"
kind: "수학의 숨은 거리"
repo: "fedify"
plain: "서명(사칭을 막는 도장)의 속이 실은 곡선 위의 계산이라는 이야기예요."
related: [sig, math-prime, math-hash]
files:
  - path: "packages/fedify/src/sig/proof.ts"
    what: "지상의 현장. createProof/verifyProof"
links:
  - label: "FEP-8b32: Object Integrity Proofs"
    href: "https://codeberg.org/fediverse/fep/src/branch/main/fep/8b32/fep-8b32.md"
---

Ed25519라는 서명 방식의, 마루 밑 공방이에요. 지상의 [의전의 방](/ko/section/fedify/rooms/sig/)에서 "Object Integrity Proof(FEP-8b32)"라고 부르는 도장은 여기서 찍혀요.

구조의 핵심은 Curve25519라는 한 곡선 위에서의 "점 더하기"예요. 곡선 위의 점과 점을 정해진 방식으로 더하면 또 곡선 위의 점이 돼요. 이 더하기를 몇억 번 거듭한 결과에서 원래 횟수를 거꾸로 셈하는 건, 지금 수학으로는 사실상 못 해요. 비밀키는 "몇 번 더했는가", 공개키는 "더한 결과의 점"이에요. 거꾸로 셈할 수 없으니 도장은 위조할 수 없어요 — 그것뿐인, 아름다운 장치예요.

지상의 공학은 이 공방을 몰라도 굴러가요. WebCrypto API가 한 줄로 서명을 돌려주니까요. 하지만 렌즈를 쓰고 여기로 내려오면, "왜 위조할 수 없다고 잘라 말할 수 있는가"의 뿌리에 닿을 수 있어요.

## 볼거리

- 키 길이는 겨우 32바이트예요. RSA 키(수백 바이트)보다 훨씬 짧은데도 같거나 더 센 강도를 가져요
- "이산 로그 문제가 어렵다"는 한 점에 안전성 전부가 얹혀 있어요
- Ed25519는 결정적 서명이에요 — 같은 문서에는 매번 같은 서명이 나와요. 난수 제비뽑기에 실패해서 비밀이 새는 고전적 사고가 구조적으로 일어나지 않죠

## 경문 한 구절

{% sutra path="packages/fedify/src/sig/proof.ts" lines="L179-L190" note="의전의 방과 같은 현장을 마루 밑에서 봐요. 바깥 라이브러리 없이, Web Crypto의 \"Ed25519\" 한 마디에 곡선이 전부 접혀 있어요" repo="fedify" %}
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

{% toy id="eccurve" /%}
