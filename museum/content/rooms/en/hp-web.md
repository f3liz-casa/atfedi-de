---
name: "The Reading Room (web)"
kind: "hackers.pub Hall"
repo: "hp"
plain: "hackers.pub's part you see in the browser, the visible screen."
related: [hp-graphql, hp-fed, hp-models, hp-bunsha]
files:
  - path: "web/main.ts"
    what: "Fresh's startup. Yoga cohabiting, with a gatekeeper"
  - path: "web/routes/@[username]"
    what: "The profile lane (the rooms for articles/followers/posts)"
  - path: "web/islands/Composer.tsx"
    what: "The representative veranda for interaction—the island where you write a post"
  - path: "web/federation.ts"
    what: "The place that breathes life into the blueprint (the builder)"
links:
  - label: "See this wing on GitHub"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/web"
---

Readers can read all of it with no JS. Writers get an island that's pleasant to write in (Composer). When you want fast pages and rich editing at once, this wing is the floor plan to copy.

In this hall, the word "islands" is an architectural term. The JS that runs on the client is only the veranda for interaction; everything else is HTML assembled on the server. In a quiet reading room, small islands float only where they're needed.

## Highlights

- In addition to Fresh's fsRoutes, main.ts has the GraphQL Yoga server and the upload proxy cohabit, and at the entrance it passes visitors through the ActorSuspendedError/isActorBanned gatekeeper
- The postgres pool in web/db.ts is max: 20—with a comment that unless it's wider than the delivery queue's concurrency of 10, connections starve when the federation gets crowded
- Even sitemaps.xml.ts and robots.txt.ts are placed as files, part of the corridor (routes)

## A passage from the sutra

{% sutra path="web/db.ts" lines="L14-L24" note="Digging the pond wide enough to match the delivery concurrency" repo="hp" %}
```typescript
export const postgres = postgresJs(DATABASE_URL, {
  // The pool size needs to exceed the ParallelMessageQueue concurrency (10)
  // to leave headroom for HTTP handlers and KV store queries.  The default
  // of 10 can cause connection starvation under federation load.
  max: 20,
});
export const db: Database = drizzle({
  relations,
  client: postgres,
  logger: getDatabaseLogger(),
});
```
{% /sutra %}
