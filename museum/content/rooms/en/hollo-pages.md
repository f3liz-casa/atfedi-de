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

The public pages by the entrance. The profile and the single-post page are not an SPA; the server assembles JSX (hono/jsx) and returns it as is—a quiet build. Only the finished HTML reaches a visitor's browser.

The parlor's finest sight is that one entrance wears two faces. Visit `/@handle` in a browser and you're shown into the parlor for humans; visit the same address declaring activity+json in the Accept header, and fedify's actor dispatcher returns an ActivityPub document. At the top of the page, an alternate link is posted, too: "the federation-facing face of this address is here."

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
