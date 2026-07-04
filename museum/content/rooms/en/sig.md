---
name: "The Chamber of Rites"
kind: "fedify Main Island"
repo: fedify
plain: "The wax seal on a letter. The room that checks whether the sender is truly who they claim, and whether anything was altered on the way."
related: [fedify-honden, math-ec, math-hash, math-graph, math-prime]
files:
  - path: packages/fedify/src/sig/http.ts
    what: "RFC 9421 + draft-cavage, double-knock, and per-party learning"
  - path: packages/fedify/src/sig/proof.ts
    what: "FEP-8b32 Object Integrity Proofs (eddsa-jcs-2022)"
  - path: packages/fedify/src/sig/ld.ts
    what: "The old-style RsaSignature2017 (uses URDNA2015 canonicalization)"
  - path: packages/fedify/src/sig/key.ts
    what: "Generating and fetching keys (RSA-4096 / Ed25519)"
links:
  - label: "See this chamber on GitHub"
    href: https://github.com/fedify-dev/fedify/tree/main/packages/fedify/src/sig
---

You stop impersonation and tampering—without writing a single line of cryptography. Outgoing letters get their wax seal stamped automatically, and arriving ones are inspected automatically. A letter from a forged sender is halted in this room, before it ever reaches your code.

Stay for the messiness of the field, too. In a sea where new and old etiquettes mix (RFC 9421 and draft-cavage), the room stamps first with the etiquette it remembers, switches if it's refused, and writes down whichever one worked (double-knock). A raw FIXME is pinned here: bleeding-edge Mastodon returns 500 to the new etiquette, so the fallback was widened to catch it. In matters of rite, the field moves before the textbook.

## Highlights

- createProof (proof.ts): reorder with JCS → SHA-256 into a shadow → join the proof's shadow and the body's shadow into 64 bytes → stamp with Ed25519. Any key that isn't Ed25519 is turned away at the door.
- verifyProofInternal: if the remembered key wasn't Ed25519, it re-fetches and recurses on itself (so as not to strip the proof twice).
- It also answers the Accept-Signature challenge of RFC 9421 §5: told to re-stamp with this etiquette, it complies in one pass.
- generateCryptoKeyPair in key.ts makes two pairs, RSA-4096 and Ed25519. All of it through Web Crypto (crypto.subtle), with no external crypto library.

## A passage from the sutra

{% sutra path="packages/fedify/src/sig/proof.ts" lines="L179-L190" note="Reorder, cast into shadow, join, and stamp" repo="fedify" %}
```typescript
  const proofCanon = serialize(proofConfig);
  const proofBytes = encoder.encode(proofCanon);
  const proofDigest = await crypto.subtle.digest("SHA-256", proofBytes);
  const digest = new Uint8Array(proofDigest.byteLength + msgDigest.byteLength);
  digest.set(new Uint8Array(proofDigest), 0);
  digest.set(new Uint8Array(msgDigest), proofDigest.byteLength);
  const sig = await crypto.subtle.sign("Ed25519", privateKey, digest);
```
{% /sutra %}

## Try it yourself

{% toy id="ed25519" /%}
