---
name: "The Stacks (models)"
kind: "hackers.pub Hall"
repo: "hp"
plain: "The ledger room that decides the shape and storage of data—posts, accounts, and the rest."
related: [hp-graphql, hp-fed, hp-web]
files:
  - path: "models/schema.ts"
    what: "The 54-table ledger and its pgEnums"
  - path: "models/db.ts"
    what: "The Database/Transaction types and runInTransaction"
  - path: "models/relations.ts"
    what: "The relationship map among the ledgers"
  - path: "models/post.ts"
    what: "The representative volume. Post creation/sync/remote ingestion"
links:
  - label: "See these stacks on GitHub"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/models"
---

You can see how the whole world of a federated social network—posts, follows, blocks, votes, reports—fits into 54 ledgers. For anyone building their own federated app, these stacks are a floor-plan reference.

At the core is a small custom called runInTransaction(). If you're already inside a transaction, you ride along; if outside, it opens a new one. Every wing in the hall leans on this single custom.

## Highlights

- Visibility is built two ways, as a pgEnum and a TS union: public / unlisted / followers / direct / none
- Each concept has a file and a test paired (post.ts/post.test.ts). And the tests are even split by scene of life—lifecycle, remote, draft
- The relationship map in relations.ts is shared by one and the same sheet—both the graphql inquiry room (Pothos drizzle) and these stacks

## A passage from the sutra

{% sutra path="models/schema.ts" lines="L31-L39" note="The five levels of visibility, in the ledger's words" repo="hp" %}
```typescript
export const POST_VISIBILITIES = [
  "public",
  "unlisted",
  "followers",
  "direct",
  "none",
] as const;

export const postVisibilityEnum = pgEnum("post_visibility", POST_VISIBILITIES);
```
{% /sutra %}
