---
name: "열네 개의 다리"
kind: "fedify 본섬 · 동쪽 기슭"
repo: "fedify"
plain: "fedify를 여러 웹 프레임워크에 잇는 변환 어댑터 모음이에요."
related: [fedify-honden, hollo-bunsha]
files:
  - path: "packages/hono/src/mod.ts"
    what: "대표 한 개. federation() 미들웨어"
  - path: "packages/nestjs/src/fedify.module.ts"
    what: "같은 다리를 NestJS 식으로 놓는 법"
  - path: "packages/express/src/index.ts"
    what: "Express 식 한 개"
links:
  - label: "다리 목록을 GitHub에서 보기"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages"
---

지금 쓰는 프레임워크 그대로 연합을 얹을 수 있어요. hono든 Express든 Next든 SvelteKit이든, 다리 하나만 import하면 같은 URL이 브라우저에는 HTML을, fedi 클라이언트에는 JSON-LD를 돌려주게 돼요. 갈아탈 필요가 없죠.

다리의 묘미는 서로 양보하는 데 있어요. fedify의 일이 아니면 프레임워크의 next()에 슬쩍 넘겨줘요 — 이 한 수 덕분에 기존 라우팅과 연합이 같은 주소에 함께 살 수 있어요.

## 볼거리

- hollo가 건너는 건 hono 다리(약 200줄)예요. 다리가 이렇게 짧은 건 fedify가 웹 표준 Request/Response로 이야기하는 덕분이죠
- nestjs 다리는 DI 모듈 한 벌(module+middleware+constants)이고, nuxt 다리는 runtime/이 딸린 Nuxt 모듈이에요 — 생태계마다의 예절에 맞춰 다리 모양이 달라져요

## 경문 한 구절

{% sutra path="packages/hono/src/mod.ts" lines="L58-L70" note="다리 한 개의 전경. 양보하는 방식까지" repo="fedify" %}
```typescript
export function federation<TContextData, THonoContext extends HonoContext>(
  federation: Federation<TContextData>,
  contextDataFactory: ContextDataFactory<TContextData, THonoContext>,
): HonoMiddleware<THonoContext> {
  return async (ctx, next) => {
    let contextData = contextDataFactory(ctx);
    if (contextData instanceof Promise) contextData = await contextData;
    return await federation.fetch(ctx.req.raw, {
      contextData,
      ...integrateFetchOptions(ctx, next),
    });
  };
}
```
{% /sutra %}
