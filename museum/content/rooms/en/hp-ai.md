---
name: "The New Wing (ai)"
kind: "hackers.pub Hall"
repo: "hp"
plain: "The wing for experimental AI features—image captions, translation, and the like."
related: [hp-models, hp-graphql]
files:
  - path: "ai/mod.ts"
    what: "All of the exposed capabilities (four of them)"
  - path: "ai/moderation.ts"
    what: "Confidence and reasons per clause. It passes no verdict"
  - path: "ai/summary.ts"
    what: "A summary with locale negotiation"
  - path: "ai/prompts"
    what: "The prompt shelf of per-locale Markdown"
links:
  - label: "See this wing on GitHub"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/ai"
---

Images get captions, long texts get summarized, posts get translated—as tools that lower the barrier to reading and writing, exactly four AI capabilities are at work.

And the way the line is drawn is the sight to see. On the moderation wall it's written: this is reference material for human moderators, not an automatic verdict. It only returns confidence and reasons. The judgment stays a human's work.

## Highlights

- Prompts are per-locale Markdown (ai/prompts/). They're picked up with readdir at import time, and the one closest to the request's language is negotiated
- The dependency runs one way, models → ai. So ai keeps its own copy of CocProvision—a small sutra-copying to preserve the wing's independence

## A passage from the sutra

{% sutra path="ai/summary.ts" lines="L10-L15" note="Reading the prompt shelf aloud at startup" repo="hp" %}
```typescript
const PROMPT_LANGUAGES: Locale[] = (
  await readdir(
    join(import.meta.dirname!, "prompts", "summary"),
    { withFileTypes: true },
  )
).map((f) => f.name.replace(/\.md$/, "")).filter(isLocale);
```
{% /sutra %}
