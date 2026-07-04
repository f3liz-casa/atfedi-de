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

The island's first gate. It resolves a name like @handle@host into an actor's address (URL)—and every journey to visit someone in the federated universe begins by passing through here.

As packages go, it is tiny: a single public entrance, lookupWebFinger(). What comes back is a small placard called a JRD (JSON Resource Descriptor), bearing the subject (the name), aliases (other names), and links (signposts that say: this person's actor document is over here).

Here is the interesting part: this package is only the visiting half. The side that answers at /.well-known/webfinger when someone visits you lives in the Main Hall (federation/webfinger.ts). This gate is for those heading out.

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
