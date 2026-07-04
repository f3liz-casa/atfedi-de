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

This sea is the fediverse itself. The Mastodon continent, the Misskey archipelago, and the three islands of this museum town all face the same sea and exchange letters by the same etiquette. That etiquette is ActivityPub—the shared rite of federated social networks, made a W3C Recommendation in 2018.

The diplomatic documents the ships carry are JSON-LD parcels called Activities. "I follow you (Follow)," "I made this (Create)," "I like it (Like)." From the sender's inbox to the outbox, sealed with an HTTP signature for a wax seal—so the receiver can verify that the body wasn't tampered with, and that it truly came from that island's keeper.

## Highlights

- Resolving a destination always begins at the [Webfinger Gate](/en/section/fedify/rooms/webfinger/). A name like @handle@host is first resolved to an actor's URL.
- The documents are JSON-LD, not plain JSON. The meaning of the vocabulary is carried by `@context`—so the ship carries the dictionary along with it.
- The wax seal (HTTP signature) has two etiquettes, new and old, and fedify's [Chamber of Rites](/en/section/fedify/rooms/sig/) picks between them to match the other party.
- No reply is the norm (fire-and-forget). Whether it arrived is told only by the HTTP response code.
