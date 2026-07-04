---
name: "The Diplomatic Sea Lanes"
kind: "Sea of Diplomacy"
plain: "The shared rule by which federated social networks exchange letters—the sea of ActivityPub."
related: [webfinger, sig, fedify-honden, relay]
links:
  - label: "ActivityPub (W3C Recommendation)"
    href: "https://www.w3.org/TR/activitypub/"
  - label: "ActivityStreams 2.0 Vocabulary"
    href: "https://www.w3.org/TR/activitystreams-vocabulary/"
---

This sea is what lets different companies, different individuals, and different software meet in one timeline. Following someone on hollo from Mastodon, a hackers.pub article flowing into Misskey—all of it happens thanks to one shared rite: ActivityPub.

The diplomatic documents the ships carry are JSON-LD parcels called Activities. "I follow you (Follow)," "I made this (Create)." The wax seal is an HTTP signature—so the receiver can verify that it truly came from that island's keeper.

## Highlights

- Resolving a destination always begins at the [Webfinger Gate](/en/section/fedify/rooms/webfinger/). A name like @handle@host is first resolved to an actor's URL.
- The documents are JSON-LD, not plain JSON. The meaning of the vocabulary is carried by `@context`—so the ship carries the dictionary along with it.
- The wax seal (HTTP signature) has two etiquettes, new and old, and fedify's [Chamber of Rites](/en/section/fedify/rooms/sig/) picks between them to match the other party.
- No reply is the norm (fire-and-forget). Whether it arrived is told only by the HTTP response code.
