---
name: "The Fourteen Bridges"
kind: "fedify Main Island · East Shore"
repo: "fedify"
plain: "A row of conversion adapters for connecting fedify to various web frameworks."
related: [fedify-honden, hollo-bunsha]
files:
  - path: "packages/hono/src/mod.ts"
    what: "The representative one: the federation() middleware"
  - path: "packages/nestjs/src/fedify.module.ts"
    what: "The same bridge, built the NestJS way"
  - path: "packages/express/src/index.ts"
    what: "The Express-style one"
links:
  - label: "See the list of bridges on GitHub"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages"
---

You add federation without leaving the framework you already use. hono, Express, Next, SvelteKit—import one bridge, and the same URL starts returning HTML to a browser and JSON-LD to a fedi client. No migration required.

The finesse of a bridge is in how it yields. If the errand isn't fedify's, it quietly hands off to the framework's next()—and with that one move, your existing routing and federation can share the same address.

## Highlights

- The bridge hollo crosses is the hono one (about 200 lines). A bridge this short is possible because fedify speaks in the web-standard Request/Response.
- The nestjs bridge is a full DI module set (module + middleware + constants); the nuxt bridge is a Nuxt module with a runtime/ folder—the bridge's shape shifts to match each ecosystem's manners.

## A passage from the sutra

{% sutra path="packages/hono/src/mod.ts" lines="L58-L70" note="The full view of a single bridge, yielding and all" repo="fedify" %}
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
