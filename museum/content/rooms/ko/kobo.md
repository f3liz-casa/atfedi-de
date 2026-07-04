---
name: "연장 공방"
kind: "fedify 본섬"
repo: "fedify"
plain: "개발자가 연합의 모습을 들여다보거나 시험해 보는 연장통이에요."
related: [fedify-honden, relay]
files:
  - path: "packages/cli/src/commands.ts"
    what: "여덟 가지 연장을 묶는 목록"
  - path: "packages/cli/src/inbox.tsx"
    what: "터미널 속 받은 편지함(TUI)"
  - path: "packages/debugger/src/mod.tsx"
    what: "createFederationDebugger() — proxy 액자"
links:
  - label: "CLI 공방"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/cli"
  - label: "debugger 선반"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/debugger"
---

나그네(개발자)를 위한 연장 가게예요. fedify CLI(약 6000줄)에는 여덟 가지 연장 — init, bench, inbox, lookup, nodeinfo, relay, tunnel, webfinger — 이 걸려 있어요.

inbox는 터미널 속 받은 편지함(TUI)인데, tunnel과 짝지으면 손안의 개발 기기 inbox에 진짜 연합의 바람을 통하게 할 수 있어요. debugger 쪽은 액자예요 — createFederationDebugger()가 돌아가는 Federation을 proxy로 감싸서, 오가는 문서를 실시간으로 보여줘요. hollo가 FEDIFY_DEBUG=true로 거는 게 바로 이 액자예요.

## 볼거리

- subcommand는 defineCommand()/CommandMetadata 타입으로 commands.ts에 묶여요
- CLI에는 bun/node로 갈린 KvStore 심(kv.bun.ts / kv.node.ts)에, 직접 만든 docloader.ts까지 있어요
- debugger는 2.0.0부터 들어온 신참이에요. 감싼 상대를 방해하지 않고, 지정한 경로 아래만 자기 부엌으로 삼아요

## 경문 한 구절

{% sutra path="packages/cli/src/commands.ts" lines="L16-L27" note="연장통의 목록" repo="fedify" %}
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
