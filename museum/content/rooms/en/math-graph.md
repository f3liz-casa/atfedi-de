---
name: "The Graph Archive"
kind: "Hidden Town of Mathematics"
repo: "fedify"
plain: "How to re-align documents that mean the same thing but are written differently into the same shape."
related: [math-hash, vocab, sig]
files:
  - path: "packages/fedify/src/sig/ld.ts"
    what: "The archive at work. jsonld.canonize (URDNA2015)"
links:
  - label: "RDF Dataset Canonicalization (W3C)"
    href: "https://www.w3.org/TR/rdf-canon/"
---

An archive for a plain-faced but deep problem: the canonicalization of JSON-LD.

The same meaning can be written countless ways. Swap the order of keys, use shorthand—the meaning holds. But a signature is stamped onto a byte string, so when the writing wavers, the seal no longer matches. So before signing, you rearrange the document, so that identical meaning (the same RDF graph) always yields the same bytes. That is canonicalization, and the algorithm RDFC-1.0 (formerly URDNA2015) does the work.

Deciding whether two graphs are the same is a cousin of graph isomorphism—a famously unsettled problem in complexity theory. Assigning canonical names to blank nodes is designed right up against that difficulty. Under the floorboards no one ever looks, a heavyweight lives.

## Highlights

- What passes through this archive (URDNA2015) is the old LD signature (RsaSignature2017). The newer FEP-8b32 gets by with a lighter rearrangement—JCS (RFC 8785, just sorting keys lexicographically). The stronger the tool, the heavier it is: the economy beneath the floor
- HTTP signatures (the seal on the envelope) don't rearrange at all; they stamp the shadow (the digest). Three rites keep company with this problem at three different depths
- Documents of the same meaning but different wording become the same shadow—the rearranging of this archive sits just before the door (SHA-256)
- The spec is the W3C's RDF Dataset Canonicalization, a fairly young canon that became a formal Recommendation in 2024

## A passage from the sutra

{% sutra path="packages/fedify/src/sig/ld.ts" lines="L1207-L1218" note="Rearrange first (canonize), then make the shadow (SHA-256)" repo="fedify" %}
```typescript
async function hashJsonLd(
  jsonLd: unknown,
  contextLoader: DocumentLoader | undefined,
): Promise<string> {
  const canon = await jsonld.canonize(jsonLd, {
    format: "application/n-quads",
    documentLoader: contextLoader ?? getDocumentLoader(),
  });
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(canon));
  return encodeHex(hash);
}
```
{% /sutra %}

## Try it yourself

{% toy id="canon" /%}
