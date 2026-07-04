---
name: "일방통행 문"
kind: "수학의 숨은 거리"
repo: fedify
plain: "어떤 문서든 짧은 \"지문\"으로 바꾸는 계산. 변조를 잡아내는 핵심이에요."
related: [sig, math-ec, math-graph]
files:
  - path: packages/fedify/src/sig/http.ts
    what: "문의 현장. Digest/Content-Digest 헤더"
---

이 문을 알면 "변조되지 않았다고 왜 잘라 말할 수 있을까?"에 답할 수 있어요. 어떤 문서든 이 문을 지나면 32바이트 그림자가 되고, 그림자에서 문서로는 돌아갈 수 없어요. 한 글자만 달라도 그림자는 아주 딴것이 돼요.

지상에서는 외교 문서의 digest가 이 문이 하는 일이에요. 도착한 문서를 스스로도 문에 지나게 해 보고, 그림자가 봉투에 적힌 것과 맞는지 봐요. 맞지 않으면, 오는 길에 누군가 손댔다는 뜻이죠.

## 볼거리

- 출력은 반드시 256비트(32바이트)예요. 입력은 한 글자든, 전집이든요
- "같은 그림자를 가진 서로 다른 두 문서"를 만드는 공격(충돌)은 SHA-256에서는 아직 아무도 해내지 못했어요 — 앞 세대인 SHA-1은 2017년에 뚫려서 은퇴했죠
- HTTP 서명이 실제로 서명하는 건 문서 자체가 아니라 이 그림자예요. 긴 문서에 직접 도장을 찍기보다 그림자에 찍는 편이 빠르고, 강도는 그대로죠
- 옛 방식(cavage)은 `Digest` 헤더, 새 방식(RFC 9421)은 `Content-Digest` 헤더예요 — 문은 같고, 붙이는 자리의 이름만 달라요

## 경문 한 구절

{% sutra path="packages/fedify/src/sig/http.ts" lines="L237-L243" note="문서의 그림자를 봉투(Digest 헤더)에 붙이는 대목" repo="fedify" %}
```typescript
  if (!headers.has("Digest") && body != null) {
    const digest = await crypto.subtle.digest("SHA-256", body);
    headers.set("Digest", `SHA-256=${encodeBase64(digest)}`);
    if (span.isRecording()) {
      span.setAttribute("http_signatures.digest.sha-256", encodeHex(digest));
    }
  }
```
{% /sutra %}

## 만져 보기

{% toy id="sha256" /%}
