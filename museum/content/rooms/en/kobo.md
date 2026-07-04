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

A tool shop for travelers (developers). The fedify CLI (about 6,000 lines) has eight tools hanging on the wall—init, bench, inbox, lookup, nodeinfo, relay, tunnel, webfinger.

inbox is an inbox inside the terminal (TUI); paired with tunnel, it lets real federation wind blow through the inbox of your local dev machine. debugger is the picture frame—createFederationDebugger() wraps a running Federation in a proxy and shows the documents passing back and forth in real time. This frame is what hollo hangs up with FEDIFY_DEBUG=true.

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
