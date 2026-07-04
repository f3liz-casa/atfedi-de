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

hono, express, fastify, koa, h3, elysia, nestjs, next, nuxt, sveltekit, fresh, astro, solidstart, cfworkers. 어느 프레임워크의 기슭에도 같은 모양의 다리가 놓여 있어요.

다리의 설계도는 어느 것이나 같아요. federation(fed, contextDataFactory)이 그 프레임워크 방식의 미들웨어를 돌려주고, 그 안에서 federation.fetch()를 불러요. 묘미는 onNotFound/onNotAcceptable이 프레임워크의 next()에 양보하는 대목이에요 — "우리 일이 아니면 그쪽으로 가세요". 이렇게 서로 양보한 덕분에, 같은 URL이 fedi 클라이언트에는 JSON-LD를, 브라우저에는 HTML을 돌려줄 수 있어요.

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
