---
name: "The Nodeinfo Notice Board"
kind: "fedify Main Island"
repo: "fedify"
plain: "A self-introduction placard that posts what software this server runs and how many people live here."
related: [webfinger, fedify-honden]
files:
  - path: "packages/fedify/src/nodeinfo/client.ts"
    what: "getNodeInfo() and the chain of forgiving parse* functions"
  - path: "packages/fedify/src/nodeinfo/handler.ts"
    what: "The side that raises the notice (handleNodeInfo/handleNodeInfoJrd)"
  - path: "packages/fedify/src/nodeinfo/types.ts"
    what: "The NodeInfo/Software/Protocol types"
links:
  - label: "See this notice board on GitHub"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/fedify/src/nodeinfo"
---

A notice board where a server posts who it is and how many residents it has. Both the posting side and the reading side live here: handleNodeInfo() and handleNodeInfoJrd() raise the notice, and getNodeInfo() goes to read someone else's.

The reader's etiquette is what's worth seeing here. Other people's notices are often malformed, so parseNodeInfo, parseSoftware, parseProtocol… form a chain of defensive parsers that quietly turn a broken placard into null. It is built to let another island's circumstances pass without blame.

## Highlights

- A corner within the Main Hall (packages/fedify/src/nodeinfo, about 2,000 lines). Three sheets: client.ts / handler.ts / types.ts.
- Protocol is a union of string literals—not just activitypub, but names from older universes too: diaspora, ostatus, xmpp.

## A passage from the sutra

{% sutra path="packages/fedify/src/nodeinfo/client.ts" lines="L306-L318" note="The names of older universes still remain in the ledger" repo="fedify" %}
```typescript
export function parseProtocol(data: unknown): Protocol | null {
  // cSpell: disable
  if (
    data === "activitypub" || data === "buddycloud" || data === "dfrn" ||
    data === "diaspora" || data === "libertree" || data === "ostatus" ||
    data === "pumpio" || data === "tent" || data === "xmpp" ||
    data === "zot"
  ) {
    // cSpell: enable
    return data;
  }
  return null;
}
```
{% /sutra %}
