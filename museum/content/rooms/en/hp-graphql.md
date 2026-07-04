---
name: "The Inquiry Room (graphql)"
kind: "hackers.pub Hall"
repo: "hp"
plain: "The window that queries data for the new screens (GraphQL)."
related: [hp-models, hp-web]
files:
  - path: "graphql/builder.ts"
    what: "Nine plugins and a tariff, the drizzle re-pasting patch"
  - path: "graphql/mod.ts"
    what: "Gathers each domain by side-effect import, then toSchema()"
  - path: "graphql/server.ts"
    what: "The Yoga server. Building context from Bearer to session"
  - path: "graphql/post.ts"
    what: "Where a single postTable transforms into three faces"
links:
  - label: "See this wing on GitHub"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/graphql"
---

A screen can ask for the data it wants, in the shape it wants, all at once. No need to ask the server for a new window every time you build a new screen—whatever shape the next hall (web-next) takes, this inquiry room answers.

The finest sight is that the same postTable transforms into three faces—Note, Article, Question. The ledger is one book, yet from the inquiry window it looks like three kinds of record.

## Highlights

- Permissions are scope-based: signed (a session exists), and an async moderator that checks by consulting the ledger
- There's a tariff on the weight of a query—anonymous up to depth 11 and complexity 20000, signed up to 20 and 25000
- builder.ts holds a candid patch that re-pastes by name to work around a quirk of drizzle-orm rc.2 (getTableConfig's primary-key column returns a different instance)
- One file per domain (account.ts, post.ts, poll.ts, moderation.ts…), each with a companion test

## A passage from the sutra

{% sutra path="graphql/builder.ts" lines="L213-L224" note="Nine plugins, layered on" repo="hp" %}
```typescript
export const builder = new SchemaBuilder<PothosTypes>({
  plugins: [
    ComplexityPlugin,
    RelayPlugin,
    ScopeAuthPlugin,
    DrizzlePlugin,
    DataloaderPlugin,
    SimpleObjectsPlugin,
    TracingPlugin,
    WithInputPlugin,
    ErrorsPlugin,
  ],
```
{% /sutra %}
