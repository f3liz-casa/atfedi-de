---
name: "연합의 방"
kind: "fedify 본섬 · 본당"
repo: "fedify"
plain: "받은 편지를 받아들이고 보낼 편지를 내보내는, 우체국 본국에 해당하는 방이에요."
related: [sig, kura, vocab, bridges, hp-fed]
files:
  - path: "packages/fedify/src/federation/middleware.ts"
    what: "4697줄짜리 일하는 몸통. FederationImpl과 여러 문맥, KvSpecDeterminer"
  - path: "packages/fedify/src/federation/federation.ts"
    what: "약속의 책. Federation/FederationBuilder의 타입과 계약"
  - path: "packages/fedify/src/federation/builder.ts"
    what: "나중에 짓는 공법(FederationBuilderImpl)"
  - path: "packages/fedify/src/federation/inbox.ts"
    what: "inbox에 도착한 문서 나누기"
links:
  - label: "이 방을 GitHub에서 보기"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/fedify/src/federation"
---

fedify의 심장부예요. inbox에 도착한 문서를 받고, outbox에서 부치고, actor 장부를 챙기고 — 연합의 살림살이 전부를 여기 있는 Federation이 도맡아요.

배치도의 숫자부터가 벌써 볼거리예요. middleware.ts 한 장이 4697줄이거든요. FederationImpl, ContextImpl, InboxContextImpl, OutboxContextImpl — 일하는 실체는 거의 이 한 장에 살고, 옆의 federation.ts(1615줄)는 반대로 거의 타입과 계약뿐이에요. "약속의 책"과 "일하는 몸"이 뚜렷하게 다른 두루마리로 갈라져 있어요.

가장 좋아하는 구석은 KvSpecDeterminer라는 작은 장부예요. 상대 섬(origin)마다 "이 사람한테는 어떤 봉랍 방식이 통했는지"를 곳간(KvStore)에 적어둬요. 연합은 의전이 아직 과도기라 모두가 같은 방식을 읽을 수 있는 건 아니거든요 — 그래서 기억해 둬요.

## 볼거리

- builder.ts(1460줄)는 "나중에 짓는" 공법이에요. hackers.pub은 이 FederationBuilder로 건물을 나눠서 지었죠
- 안정성을 맡는 칸막이들이 함께 살아요: circuit-breaker.ts(상태가 나쁜 상대와는 조금 거리를 둬요), idempotency.ts(같은 문서를 두 번 읽지 않게 막아요), retry.ts, keycache.ts
- negotiation.ts는 같은 URL에서 HTML과 JSON-LD를 가려 내주는 content negotiation의 방석이에요

## 경문 한 구절

{% sutra path="packages/fedify/src/federation/middleware.ts" lines="L4631-L4650" note="상대마다 통했던 방식을 장부에 적어둬요" repo="fedify" %}
```typescript
  async determineSpec(
    origin: string,
  ): Promise<HttpMessageSignaturesSpec> {
    return await this.kv.get<HttpMessageSignaturesSpec>([
      ...this.prefix,
      origin,
    ]) ?? this.defaultSpec;
  }

  async rememberSpec(
    origin: string,
    spec: HttpMessageSignaturesSpec,
  ): Promise<void> {
    await this.kv.set([...this.prefix, origin], spec);
  }
```
{% /sutra %}
