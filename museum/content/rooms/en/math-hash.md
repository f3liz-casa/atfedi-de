---
name: "The One-Way Door"
kind: "Hidden Town of Mathematics"
repo: fedify
plain: "A computation that turns any document into a short \"fingerprint.\" The core of tamper detection."
related: [sig, math-ec, math-graph]
files:
  - path: packages/fedify/src/sig/http.ts
    what: "The door's site: the Digest / Content-Digest headers"
---

Know this door and you can answer "how can you be sure nothing was tampered with?" Any document, once it passes through this door, becomes a 32-byte shadow, and there is no road back from the shadow to the document. Differ by even one character and the shadow becomes something entirely different.

Upstairs, the digest on a diplomatic document is this door's work. You pass an arriving document through the door yourself and see whether its shadow matches what the envelope declares. If it doesn't match, someone touched it along the way.

## Highlights

- The output is always 256 bits (32 bytes). The input can be a single character or a complete works.
- The attack of making "two different documents with the same shadow" (a collision) has, for SHA-256, not yet been achieved by anyone—the previous generation, SHA-1, was broken in 2017 and retired.
- What an HTTP signature actually signs is not the document itself but this shadow. Stamping the shadow is faster than stamping a long document directly, and the strength is the same.
- The old etiquette (cavage) uses the `Digest` header, the new (RFC 9421) the `Content-Digest` header—the door is the same; only the name of where it's affixed differs.

## A passage from the sutra

{% sutra path="packages/fedify/src/sig/http.ts" lines="L237-L243" note="Affixing the document's shadow to the envelope (the Digest header)" repo="fedify" %}
```typescript
  if (!headers.has("Digest") && body != null) {
    const digest = await crypto.subtle.digest("SHA-256", body);
    headers.set("Digest", `SHA-256=${encodeBase64(digest)}`);
    if (span.isRecording()) {
      span.setAttribute("http_signatures.digest.sha-256", encodeHex(digest));
    }
  }
```
{% /sutra %}

## Try it yourself

{% toy id="sha256" /%}
