---
name: "道具の工房"
kind: "fedify 本島"
repo: "fedify"
plain: "開発者が連合の様子を覗いたり試したりするための、道具箱です。"
related: [fedify-honden, relay]
files:
  - path: "packages/cli/src/commands.ts"
    what: "8つの道具を束ねる目録"
  - path: "packages/cli/src/inbox.tsx"
    what: "端末の中の受信箱(TUI)"
  - path: "packages/debugger/src/mod.tsx"
    what: "createFederationDebugger()——proxyの額縁"
links:
  - label: "CLIの工房"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/cli"
  - label: "debuggerの棚"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/debugger"
---

連合の様子を、手元で覗けます。`fedify init` で新しい島の縄張りが引けて、`fedify lookup` でよそのactorの中身が見られて、`fedify inbox` と `tunnel` を組めば、本物のMastodonからの手紙を自分のノートPCで受け取れます。

debuggerは額縁です。動いているFederationをproxyで包んで、行き交う文書をリアルタイムで見せてくれる。「いま何が届いて、何を返したのか」が見えるだけで、連合の開発はずいぶん怖くなくなります。

## 見どころ

- subcommandはdefineCommand()/CommandMetadataの型でcommands.tsに束ねられる
- CLIにはbun/nodeで分かれたKvStoreシム(kv.bun.ts / kv.node.ts)と、自前のdocloader.tsまである
- debuggerは2.0.0からの新入り。包んだ相手の邪魔をせず、指定パスの下だけ自分の台所にする

## 経文の一節

{% sutra path="packages/cli/src/commands.ts" lines="L16-L27" note="道具箱の目録" repo="fedify" %}
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
