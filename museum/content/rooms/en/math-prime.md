---
name: "The Well of Primes"
kind: "Hidden Town of Mathematics"
repo: "fedify"
plain: "The story that the older seal—RSA—is, inside, the multiplication of large primes."
related: [math-ec, sig]
files:
  - path: "packages/fedify/src/sig/key.ts"
    what: "The well-digging site: two pairs, RSA-4096 and Ed25519"
---

The well of RSA. A stone-laid well, older than the Elliptic Curve Atelier. The fediverse's old etiquette (draft-cavage's HTTP signatures) still draws water from this well. So fedify carries both RSA and Ed25519 keys—to speak with both the new town and the old.

The principle fits in one line. Picking two large primes and multiplying them takes an instant. Shown only the product and asked to divide back to the original two, you would need a thousand years, if the digits are large enough. Multiplication is walking downhill; factoring is climbing. In the well, falling is easy and climbing is hard.

## Highlights

- In the Mastodon-compatible world, an actor's public key is posted on the profile as `publicKeyPem`—the well's location is public, and the secret is only the two primes.
- A 2,048-bit key length is the current standard. Compared to the curve's 32 bytes, it takes much larger stones for the same strength.
- Once quantum computers become practical, this well (along with the Elliptic Curve Atelier) is slated to be filled in. Design of the successor well—post-quantum cryptography—has already begun.
- fedify's generateCryptoKeyPair defaults to RSASSA-PKCS1-v1_5, modulusLength 4096—laid with stones thicker than the standard 2,048.

## A passage from the sutra

{% sutra path="packages/fedify/src/sig/key.ts" lines="L85-L100" note="The old well (RSA-4096) and the new workshop (Ed25519) come out of the same tap" repo="fedify" %}
```typescript
  if (algorithm == null || algorithm === "RSASSA-PKCS1-v1_5") {
    return crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"],
    );
  } else if (algorithm === "Ed25519") {
    return crypto.subtle.generateKey(
      "Ed25519",
      true,
      ["sign", "verify"],
```
{% /sutra %}

## Try it yourself

{% toy id="prime" /%}
