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

You speak the shared language of federation as types. Build a Note or a Follow as an ordinary object, and it becomes valid JSON-LD that crosses the sea. Misspell something and the build tells you; your editor's autocomplete stands in for the spec.

And this sutra is not handwritten. From one YAML sheet per word, the code is copied out by generation—sutra-copying exists here as a real build step, not a metaphor. The dictionary carries every real-world dialect too, toot: and misskey: and the rest. The language of federation is a living language.

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
