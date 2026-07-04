---
name: "Fedify Branch Temple (npm edition)"
kind: "Hollo Grounds · Branch Temple"
repo: "hollo"
plain: "The fedify library itself, living inside hollo (a copy installed from npm)."
related: [sig, fedify-honden]
files:
  - path: package.json
    what: "The eight scrolls of @fedify/*, all ^2.3.0"
  - path: src/index.tsx
    what: "The one-line federation() middleware, a covered walkway"
  - path: src/federation/federation.ts
    what: "The one createFederation() in the hall"
links:
  - label: "To the head temple (fedify Main Island)"
    href: https://github.com/fedify-dev/fedify
  - label: "The npm edition's catalog"
    href: https://www.npmjs.com/package/@fedify/fedify
---

The fedify copied like a sutra from the npm edition is housed here. package.json holds eight scrolls of @fedify/\*—fedify itself, the hono bridge, the postgres storehouse, vocab, webfinger, debugger, and two small markdown-it paths—all standing together at ^2.3.0.

The join between branch temple and hall is a single line: `app.use(federation(fedi, ...))` in `src/index.tsx`. And because it's placed before the pages/oauth/api routers, the same address `/@handle` becomes fedify's face or the parlor's face depending on how you visit (the Accept header). The branch temple keeps a low profile, yet it decides every manner of the hall's entrance.

By the way, this hall's nameplate (the package name) is `@fedify/hollo`. hollo is now a member of the fedify-dev household. The branch temple and the head temple share a family name.

## Highlights

- createFederation() is called just once in the hall (`src/federation/federation.ts`). After that, everyone passes around and reads the same instance
- The @fedify/vocab vocabulary (Accept/Announce/Create/EmojiReact/Follow/Like/Move/QuoteRequest…) is imported directly all over the code
- Search (v2 search), too, uses lookupObject/isActor by way of @fedify/vocab

## A passage from the sutra

{% sutra path="src/index.tsx" lines="L69-L76" note="This one line is the covered walkway between branch temple and hall. It stands ahead of the routers" repo="hollo" %}
```typescript
app.use(federation(fedi, (_) => undefined));

app.route("/", pages);
app.route("/oauth", oauth);
app.route("/api", api);
app.route("/image", image);
app.route("/proxy", proxy);
```
{% /sutra %}
