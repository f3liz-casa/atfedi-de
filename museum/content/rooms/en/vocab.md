---
name: "The Vocabulary Sutra Repository"
kind: "fedify Main Island"
repo: "fedify"
plain: "A dictionary of the federated world's shared language—post, follow, like."
related: [math-logic, sig, fedify-honden]
files:
  - path: "packages/vocab/src/note.yaml"
    what: "One source sheet of the sutra: uri, extends, and a defaultContext with real-world dialects in it"
  - path: "packages/vocab/scripts/codegen.ts"
    what: "The sutra-copying desk, with a lock and a freshness check"
  - path: "packages/vocab-tools/src/generate.ts"
    what: "generateVocab(): reads the YAML and writes out the classes"
  - path: "packages/vocab-tools/src/class.ts"
    what: "generateClasses() and the family tree of types (sortTopologically)"
links:
  - label: "See this repository on GitHub"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/vocab"
---

Note, Follow, Like… a sutra repository where the ActivityStreams vocabulary is housed as TypeScript types. And this sutra is not handwritten. One YAML sheet per word (note.yaml, activity.yaml…) serves as the source of the sutra, and the code is copied out from there by generation. Here sutra-copying is not a metaphor but a real build step.

Peek into defaultContext in note.yaml and you see this repository's honesty. toot: (Mastodon), misskey:, fedibird:, FEP-044f's quote—not just textbook vocabulary, but every real-world dialect written into the dictionary too. The language of federation is a living language.

## Highlights

- The source of the sutra is packages/vocab/src/*.yaml. It declares name/uri/extends/defaultContext/properties and is inspected against vocab-tools' schema.yaml.
- The sutra-copying desk is codegen.ts—with an mkdir lock and an mtime freshness check, it won't re-bake what hasn't changed.
- The generator's parts are class.ts/codec.ts/constructor.ts/property.ts. The classes, the encoder/decoder, the clone, the inspector—all of it is generated.
- The runtime footing is a separate package, @fedify/vocab-runtime (which bundles jsonld).

## A passage from the sutra

{% sutra path="packages/vocab-tools/src/generate.ts" lines="L5-L18" note="Reading the spec and copying out the types—the hands of the sutra-copyist" repo="fedify" %}
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

## Try it yourself

{% toy id="vocabjson" /%}
