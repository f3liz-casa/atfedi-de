---
name: "The Webfinger Gate"
kind: "fedify Main Island · First Gate"
repo: "fedify"
plain: "A phone book. From a handle like @name@which-island, it finds that person's real address (URL)."
related: [fedify-honden, nodeinfo, sea-route]
files:
  - path: "packages/webfinger/src/lookup.ts"
    what: "The lookupWebFinger() client"
  - path: "packages/webfinger/src/jrd.ts"
    what: "JRD types: ResourceDescriptor and Link"
links:
  - label: "See this gate on GitHub"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/webfinger"
---

One handle finds anyone in the universe. Write @friend@mastodon.social and your app can look up their real address (URL), no matter which server they live on. To do it yourself, you call `lookupWebFinger()` once—you never have to learn how the phone book works underneath.

This package is only the visiting half. The side that answers at /.well-known/webfinger when someone visits you lives in the Main Hall. This gate is for those heading out.

## Highlights

- About 1,400 lines in all. One of the smallest packages on the island.
- One public entrance only: lookupWebFinger() (lookup.ts). Tune its behavior with LookupWebFingerOptions.
- ResourceDescriptor and Link in jrd.ts are the exact shape of the placard WebFinger hands back.

## A passage from the sutra

{% sutra path="packages/webfinger/src/jrd.ts" lines="L5-L9" note="The shape of the placard received at the gate" repo="fedify" %}
```typescript
export interface ResourceDescriptor {
  subject?: string;
  aliases?: string[];
  properties?: Record<string, string | null>;
  links?: Link[];
```
{% /sutra %}

## Try it yourself

{% toy id="webfinger" /%}
