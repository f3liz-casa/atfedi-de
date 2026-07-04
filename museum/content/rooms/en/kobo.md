---
name: "The Toolmaker's Workshop"
kind: "fedify Main Island"
repo: "fedify"
plain: "A toolbox for developers to peek at and experiment with what federation is doing."
related: [fedify-honden, relay]
files:
  - path: "packages/cli/src/commands.ts"
    what: "The catalog that bundles the eight tools"
  - path: "packages/cli/src/inbox.tsx"
    what: "An inbox inside the terminal (TUI)"
  - path: "packages/debugger/src/mod.tsx"
    what: "createFederationDebugger()—the picture frame made of a proxy"
links:
  - label: "The CLI workshop"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/cli"
  - label: "The debugger shelf"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/debugger"
---

You peek at what federation is doing from right where you sit. `fedify init` stakes out a new island, `fedify lookup` shows you the insides of someone else's actor, and pair `fedify inbox` with `tunnel` and real letters from Mastodon land in the inbox of your own laptop.

The debugger is a picture frame. It wraps a running Federation in a proxy and shows you the documents passing back and forth in real time. Just being able to see what arrived and what you sent back makes federated development a lot less frightening.

## Highlights

- Subcommands are bundled in commands.ts via the defineCommand()/CommandMetadata types.
- The CLI even has KvStore shims split by bun/node (kv.bun.ts / kv.node.ts) and its own docloader.ts.
- debugger is a newcomer since 2.0.0. It doesn't disturb what it wraps; it makes only the area under a given path its own kitchen.

## A passage from the sutra

{% sutra path="packages/cli/src/commands.ts" lines="L16-L27" note="The catalog of the toolbox" repo="fedify" %}
```typescript
import { benchMetadata, benchOptions } from "./bench/command.ts";
import { inboxMetadata, inboxOptions } from "./inbox/command.ts";
import { lookupMetadata, lookupOptions } from "./lookup/command.ts";
import { nodeInfoMetadata, nodeInfoOptions, runNodeInfo } from "./nodeinfo.ts";
import type { GlobalOptions } from "./options.ts";
import { relayMetadata, relayOptions } from "./relay/command.ts";
import { runTunnel, tunnelMetadata, tunnelOptions } from "./tunnel.ts";
import { webFingerMetadata, webFingerOptions } from "./webfinger/command.ts";
```
{% /sutra %}
