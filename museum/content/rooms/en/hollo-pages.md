---
name: "The Parlor"
kind: "Hollo Hall · 3F"
repo: "hollo"
plain: "hollo's public profile and post pages, the ones you see in a browser."
related: [hollo-api, hollo-fed, webfinger]
files:
  - path: "src/pages/index.tsx"
    what: "The parent router that bundles the public and admin pages"
  - path: "src/pages/profile/index.tsx"
    what: "The public profile. Drizzle paging and the activity+json alternate link"
  - path: "src/pages/profile/profilePost.tsx"
    what: "The permalink page for a single post"
  - path: "src/pages/federation.tsx"
    what: "The dashboard where an admin fetches remote actors/posts"
links:
  - label: "See this floor on GitHub"
    href: "https://github.com/fedify-dev/hollo/tree/main/src/pages"
---

You get an address. Your posts can be shown to anyone with just a URL, even people who run no dedicated app—open it in a browser and it's a quiet page; peek at the same address from fedi and it becomes an actor's face.

The build is no SPA; it's the quiet way of assembling HTML on the server and returning it as is. Only the finished page reaches a visitor's browser.

## Highlights

- `src/pages/index.tsx` is a single Hono router that bundles all the subpages—home, profile (`/:handle{@[^/]+}`), login, setup, emoji management
- Profile posts are pulled straight through Drizzle (PAGE_SIZE=30, public and unlisted only). The page and cont queries are inspected, and anything suspicious gets a 404
- Post HTML passes through an XSS sanitizer before display
- The admin screens are guarded by csrf() and loginRequired, and `federation.tsx` even has a small intake where an admin fetches a remote actor/post by hand and copies it into the ledger

## A passage from the sutra

{% sutra path="src/pages/profile/index.tsx" lines="L220-L232" note="A signpost to the same address's other, federation-facing face" repo="hollo" %}
```tsx
      links={[
        ...(atomUrl == null
          ? []
          : [
              { rel: "alternate", type: "application/atom+xml", href: atomUrl },
            ]),
        {
          rel: "alternate",
          type: "application/activity+json",
          href: `/@${accountOwner.handle}`,
        },
      ]}
```
{% /sutra %}
