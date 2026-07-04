---
name: "The Temple of Logic"
kind: "Hidden Town of Mathematics"
repo: "fedify"
plain: "A way of seeing: when a type check passes, a small proof passes."
related: [vocab, math-graph]
files:
  - path: "packages/vocab-tools/src/generate.ts"
    what: "Where types are born. The spec, copied into types like a sutra"
---

Know this temple, and "the type check passes" gains a little depth. A type is a proposition, and a typed value is a small proof—having assembled a value of type `Note` means the proposition "this has the shape of a Note" now has its proof.

Types vanish at runtime. The temple leaves no building standing on the ground—yet because only documents that pass the review board the ship, accidents across the sea grow fewer. As ways for mathematics to hold up engineering go, this may be the quietest.

## Highlights

- The repository's types are copied like a sutra, mechanically, from the Activity Vocabulary spec—a chain of copying where the spec becomes types and the types become checks
- A type check proves only that something has the shape; it does not prove the content is correct. Even the temple's review has its jurisdiction
- In proof assistants that carry Curry–Howard to its conclusion (Lean, Coq, and the like), mathematical theorems themselves are checked by type checking. That is the head temple of this shrine

## A passage from the sutra

{% sutra path="packages/vocab-tools/src/generate.ts" lines="L5-L18" note="Looking up from beneath the floor at the repository's copying desk—the moment a spec becomes a type (a proposition)" repo="fedify" %}
```typescript
export default async function generateVocab(
  schemaDir: string,
  generatedPath: string,
): Promise<void> {
  const types = await loadSchemaFiles(schemaDir);
  const encoder = new TextEncoder();

  const file = await open(generatedPath, "w");
  const writer = file.createWriteStream();

  for await (const code of generateClasses(types)) {
    writer.write(encoder.encode(code));
  }
```
{% /sutra %}
