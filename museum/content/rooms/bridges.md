---
name: "十四の橋"
kind: "fedify 本島・東岸"
repo: "fedify"
plain: "fedifyをいろいろなWebフレームワークにつなぐための、変換アダプタの並びです。"
related: [fedify-honden, hollo-bunsha]
files:
  - path: "packages/hono/src/mod.ts"
    what: "代表の一本。federation()ミドルウェア"
  - path: "packages/nestjs/src/fedify.module.ts"
    what: "同じ橋の、NestJS流の架けかた"
  - path: "packages/express/src/index.ts"
    what: "Express流の一本"
links:
  - label: "橋の一覧をGitHubで見る"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages"
---

hono、express、fastify、koa、h3、elysia、nestjs、next、nuxt、sveltekit、fresh、astro、solidstart、cfworkers。どのフレームワークの岸にも、同じ形の橋が架かっています。

橋の設計図はどれも同じです。federation(fed, contextDataFactory)がその框組の作法のミドルウェアを返し、中でfederation.fetch()を呼ぶ。妙味はonNotFound/onNotAcceptableが框組のnext()に譲るところ——「うちの用でなければ、そちらへどうぞ」。この譲り合いのおかげで、同じURLがfediクライアントにはJSON-LDを、ブラウザにはHTMLを返せます。

## 見どころ

- holloが渡るのはhonoの橋(約200行)。橋がこんなに短いのは、fedifyがWeb標準のRequest/Responseで話すおかげ
- nestjsの橋はDIモジュール一式(module+middleware+constants)、nuxtの橋はruntime/つきのNuxtモジュール——生態系ごとの礼儀に合わせて、橋の形が変わる

## 経文の一節

{% sutra path="packages/hono/src/mod.ts" lines="L58-L70" note="橋一本の全景。譲りかたまで含めて" repo="fedify" %}
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
