---
name: "소수의 우물"
kind: "수학의 숨은 거리"
repo: "fedify"
plain: "오래된 쪽 도장(RSA)의 속은 큰 소수의 곱셈이라는 이야기예요."
related: [math-ec, sig]
files:
  - path: "packages/fedify/src/sig/key.ts"
    what: "우물 파는 현장. RSA-4096과 Ed25519 두 쌍"
---

이 우물을 알면 "키가 길면 안전하다"는 말의 뜻이 몸으로 와닿아요. 큰 소수를 둘 곱하는 건 한순간, 그 곱에서 되돌려 나누는 건 천 년 — 떨어지기는 쉽고 오르기는 어려운 우물이죠.

페디버스의 옛 방식(draft-cavage의 HTTP 서명)은 지금도 이 우물의 물을 써요. 그래서 fedify는 RSA 키와 Ed25519 키를 둘 다 지니고 다녀요 — 새 마을과도, 옛 마을과도 이야기하려고요.

## 볼거리

- Mastodon 호환 세계에서는 actor의 공개키가 `publicKeyPem`으로 프로필에 붙어 나와요 — 우물의 위치는 공개 정보이고, 비밀은 "두 소수"뿐이죠
- 키 길이 2048비트가 지금의 표준이에요. 곡선의 32바이트와 견주면, 같은 강도를 내려고 꽤 큰 돌이 필요해요
- 양자 컴퓨터가 실용화되면 이 우물은 (타원곡선 공방과 함께) 메워질 예정이에요. 뒤를 이을 우물(양자내성 암호)의 설계는 이미 시작됐죠
- fedify의 generateCryptoKeyPair 기본값은 RSASSA-PKCS1-v1_5, modulusLength 4096이에요 — 표준인 2048보다 굵은 돌로 쌓았죠

## 경문 한 구절

{% sutra path="packages/fedify/src/sig/key.ts" lines="L85-L100" note="오래된 우물(RSA-4096)과 새로운 공방(Ed25519)이 같은 수도꼭지에서 나와요" repo="fedify" %}
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

## 만져 보기

{% toy id="prime" /%}
