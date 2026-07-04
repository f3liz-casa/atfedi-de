---
name: "Reception (Mastodon API)"
kind: "Hollo Hall · 2F"
repo: "hollo"
plain: "A compatibility desk that lets your existing Mastodon app work as is."
related: [hollo-fed, hollo-oauth, hollo-bunsha]
files:
  - path: "src/api/index.ts"
    what: "The root of the Mastodon API. compress and CORS, mounts v1/v2"
  - path: "src/api/v1/statuses.ts"
    what: "Post CRUD and boost/favorite. Delivery starts here, too"
  - path: "src/api/v2/index.ts"
    what: "v2 search. Searches outward with fedify's lookupObject"
  - path: "src/oauth/middleware.ts"
    what: "tokenRequired/scopeRequired—the corridor every write passes through"
---

You can live in your existing Mastodon app as is. IceCubes, Toot!—just point them at hollo. Switch servers and the app your fingers already know stays the same: that's Reception's promise.

Reception is also the translator. When an app says "post this," it goes right on to carry out delivery to the outer universe. Reception and the Diplomacy Office share a corridor.

## Highlights

- `src/api/index.ts` stands up hono/compress and CORS (exposing the Link header) first, then mounts v1/v2
- Validation is @hono/zod-validator plus inline zod. v2 search clamps limit to between 1 and 40
- Delivery carries an orderingKey derived from the post IRI, and excludeBaseUris prevents misdelivery to its own island
- With resolve=true, v2 search goes out to the outer universe via lookupObject(), and when it finds something, it copies it into the ledger with persistAccount/persistPost before answering

## A passage from the sutra

{% sutra path="src/api/v1/statuses.ts" lines="L601-L618" note="From inside the post handler, diplomacy (delivery) begins right away" repo="hollo" %}
```typescript
    const activity = toCreate(post, fedCtx);
    const orderingKey = getPostOrderingKey(post.iri);
    await fedCtx.sendActivity(
      { username: handle },
      getRecipients(post),
      activity,
      {
        orderingKey,
        excludeBaseUris: [new URL(c.req.url)],
      },
    );
    if (post.visibility !== "direct") {
      await fedCtx.sendActivity({ username: handle }, "followers", activity, {
```
{% /sutra %}
