---
name: "그래프 서고"
kind: "수학의 숨은 거리"
repo: "fedify"
plain: "쓰는 방식만 다를 뿐 뜻은 같은 문서를, 같은 모양으로 다시 맞추는 이야기예요."
related: [math-hash, vocab, sig]
files:
  - path: "packages/fedify/src/sig/ld.ts"
    what: "서고의 현장. jsonld.canonize(URDNA2015)"
links:
  - label: "RDF Dataset Canonicalization (W3C)"
    href: "https://www.w3.org/TR/rdf-canon/"
---

JSON-LD 정규화(canonicalization)라는, 수수한 얼굴을 한 깊은 문제를 다루는 서고예요.

같은 뜻을 담은 문서는 얼마든지 다르게 쓸 수 있어요. 키 순서를 바꿔도, 생략 표기를 써도 뜻은 같아요. 그런데 서명은 "바이트 열"에 찍는 거라서, 쓰는 방식이 흔들리면 검인이 맞지 않게 돼요. 그래서 뜻(RDF 그래프)이 같으면 반드시 같은 바이트 열이 나오도록 문서를 다시 늘어놓고 나서 서명해요. 그게 바로 정규화이고, RDFC-1.0(옛 이름 URDNA2015)이라는 알고리즘이 맡아요.

"같은 그래프인가"를 가리는 문제는 그래프 동형 판정이라는, 계산 복잡도 이론에서도 자리를 못 잡는 유명한 난제와 사촌 사이예요. 빈 노드에 정규 이름을 붙이는 작업은 그 어려움과 바로 옆에 붙어 설계돼 있어요. 평소 아무도 안 보는 마루 밑에, 이런 거물이 살고 있는 거죠.

## 볼거리

- 이 서고(URDNA2015)를 지나는 건 옛 LD 서명(RsaSignature2017)이에요. 새 FEP-8b32는 더 가벼운 재배열 — JCS(RFC 8785, 키를 사전순으로 늘어놓기만 해요) — 로 끝내요. 강한 연장일수록 무겁다는, 마루 밑의 경제 원리죠
- HTTP 서명(봉투의 도장)은 애초에 재배열을 하지 않고, 그림자(digest)에 찍어요. 세 가지 의전이 저마다 다른 깊이로 이 문제와 어울리고 있어요
- 뜻은 같고 쓰는 방식만 다른 문서가 같은 그림자가 돼요 — 문(SHA-256) 앞에, 이 서고의 재배열이 끼어들어요
- 명세는 W3C의 "RDF Dataset Canonicalization"이에요. 2024년에 정식 권고가 된, 꽤 젊은 정전이죠

## 경문 한 구절

{% sutra path="packages/fedify/src/sig/ld.ts" lines="L1207-L1218" note="재배열하고(canonize) 나서, 그림자(SHA-256)로 만들어요" repo="fedify" %}
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

## 만져 보기

{% toy id="canon" /%}
