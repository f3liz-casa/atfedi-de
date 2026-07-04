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

The door of SHA-256. A document of any length, once it passes through this door, comes out as a 32-byte shadow. There is no road back from the shadow to the original document. And if the document differs by even one character, the shadow becomes something entirely different.

Upstairs, the `Digest` header on a diplomatic document is this door's work. An island that receives a document by ship first passes it through the door itself, and checks whether the shadow matches what the envelope declares. If it doesn't match, someone touched the text along the way.

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
