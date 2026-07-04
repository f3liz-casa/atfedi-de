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

이 방이 있어서 "연합하는 앱"이 몇 줄이면 세워져요. inbox 접수, outbox 발송, actor 장부, 실패한 배달 다시 하기 — 연합의 살림살이를 통째로 맡기면, 앱의 알맹이(무엇을 올릴 수 있고 어떻게 보여줄지)만 생각하면 돼요. hollo도 hackers.pub도 그렇게 세워졌어요.

가장 좋아하는 구석은 KvSpecDeterminer라는 작은 장부예요. 상대 섬마다 "어떤 봉랍 방식이 통했는지"를 기억해 둬요. 연합은 의전이 아직 과도기라 모두가 같은 방식을 읽을 수 있는 건 아니거든요 — 그런 현실과 어울리는 방법까지 맡길 수 있어요.

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
