---
name: "The Elliptic Curve Atelier"
kind: "Hidden Town of Mathematics"
repo: "fedify"
plain: "The story that a signature—the seal that prevents impersonation—is really a computation on a curve."
related: [sig, math-prime, math-hash]
files:
  - path: "packages/fedify/src/sig/proof.ts"
    what: "The site upstairs: createProof/verifyProof"
links:
  - label: "FEP-8b32: Object Integrity Proofs"
    href: "https://codeberg.org/fediverse/fep/src/branch/main/fep/8b32/fep-8b32.md"
---

Know this workshop and you can answer "why can't a signature be forged?" in your own words. To merely use it, Web Crypto does the work in one line—which is exactly why the underfloor is a pleasure reserved for those who want to look.

The core of the mechanism is "point addition" on a curve. From the result of repeating that addition hundreds of millions of times, working back to the original number of steps is, in today's mathematics, effectively impossible. The private key is how many times you added; the public key is the resulting point. Because you can't work backward, the seal can't be forged—a beautiful contrivance, and that's all it is.

## Highlights

- The key is just 32 bytes long. Far shorter than an RSA key (hundreds of bytes), yet it holds equal or greater strength.
- All of the security rests on a single point: that the discrete logarithm problem is hard.
- Ed25519 is a deterministic signature—the same document yields the same signature every time. The classic accident, where a bad random draw leaks the secret, cannot happen by construction.

## A passage from the sutra

{% sutra path="packages/fedify/src/sig/proof.ts" lines="L179-L190" note="The same scene as the Chamber of Rites, seen from below the floor. No external library; the whole curve is folded into Web Crypto's single word \"Ed25519\"" repo="fedify" %}
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

{% toy id="eccurve" /%}
