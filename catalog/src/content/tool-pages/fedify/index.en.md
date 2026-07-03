## Fedify

A TypeScript framework for building ActivityPub servers — it handles the
federation plumbing for you.

[icon:scale] MIT · [icon:code] TypeScript · [icon:house] [fedify.dev](https://fedify.dev) · [icon:git-branch] [Repo](https://github.com/fedify-dev/fedify)

### Why it exists

ActivityPub in the field means four signature mechanisms — two for HTTP
requests, two for documents — JSON that changes shape between servers,
deliveries that arrive out of order, and per-server quirks the spec never
mentions. Fedify turns that pain into defaults — its author wrote the field
guide:
[Why ActivityPub is hard](https://hackers.pub/@fedify/2026/why-activitypub-is-hard).

### Who it's for

- [icon:rocket] **A new federated app in TypeScript or JavaScript** — fedify
  at full strength. Ghost, Hollo, and Hackers' Pub run it in production.
- [icon:puzzle] **An existing app that should federate** — integrations for
  Express, Hono, Next.js, SvelteKit, and a dozen more.
- [icon:braces] **Anyone tired of hand-writing JSON-LD** — the typed
  vocabulary alone is worth adopting.
- [icon:book-open] **Implementers in other languages** — deterministic
  output makes it a byte-exact answer sheet.

### The good part

- [icon:sliders-horizontal] The whole federation core is **one options
  object** — about two dozen lines in Hollo.
- [icon:inbox] The inbox is **a routing table** — signatures are verified
  before your handler runs.
- [icon:user-round] An actor is **a database lookup** — WebFinger, NodeInfo,
  and key publishing come free.
- [icon:send] Delivery to every follower is **one call** — fan-out, retries,
  and ordering included.

:::card
[icon:heart-handshake] [What it feels like](/build/fedify/feels-good) — with receipts from Hollo and Hackers' Pub
:::

### The road

Federation grows in stages, each one verifiable before the next:
be findable → be followable → speak → listen → interact → grow up.
The first three are thin; the fourth is where your real work lives.

:::card
[icon:milestone] [The roadmap](/build/fedify/roadmap) — six stages with checkpoints, and how far the road goes
:::

### Keep in mind

- [icon:database] **Persistence is yours** — fedify stores nothing; mirroring
  remote actors and posts is the real work.
- [icon:gavel] **Policy is yours** — accepting follows, moderation,
  honoring deletes.
- [icon:triangle-alert] **Sharp edges exist** — immutable vocab, `Object`
  shadowing, cross-origin re-fetches, two key types.

:::card
[icon:triangle-alert] [Keep in mind](/build/fedify/watch-out) — the traps, each with where it's written down
:::

### Running it

- [icon:split] Split web and worker processes.
- [icon:shield-check] Leave the safety rails on.
- [icon:terminal] Debug with the CLI, lint in your editor.

:::card
[icon:wrench] [Running it](/build/fedify/running) — ops, debugging, and where to start
:::

### See also

:::cards
- [icon:map] **Why ActivityPub is hard** — the author's field guide to what fedify saves you from — [hackers.pub](https://hackers.pub/@fedify/2026/why-activitypub-is-hard)
- [icon:git-branch] **Read the code** — production fedify codebases worth an evening's reading — [Hollo](https://github.com/fedify-dev/hollo) [Hackers' Pub](https://github.com/hackers-pub/hackerspub)
- [icon:notebook-pen] **We used fedify, then graduated from it** — our field report from running fedify in production, and moving off it — [blog.atfedi.de](https://blog.atfedi.de/en/leaving-fedify)
:::
