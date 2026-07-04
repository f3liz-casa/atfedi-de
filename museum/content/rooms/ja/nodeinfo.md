---
name: "nodeinfo 高札場"
kind: "fedify 本島"
repo: "fedify"
plain: "「このサーバは何のソフトで、何人住んでいるか」を掲げる自己紹介の札です。"
related: [webfinger, fedify-honden]
files:
  - path: "packages/fedify/src/nodeinfo/client.ts"
    what: "getNodeInfo()と、寛容なparse*の鎖"
  - path: "packages/fedify/src/nodeinfo/handler.ts"
    what: "高札を立てる側(handleNodeInfo/handleNodeInfoJrd)"
  - path: "packages/fedify/src/nodeinfo/types.ts"
    what: "NodeInfo/Software/Protocolの型"
links:
  - label: "この高札をGitHubで見る"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/fedify/src/nodeinfo"
---

あなたのサーバの自己紹介を、宇宙に読める形で掲げられます。何のソフトで、何人住んでいるか——fedi統計サイトにあなたの島が載るのは、この高札のおかげです。立てるのも読むのも、それぞれ関数ひとつ。

読む側の作法が、この部屋の見どころです。よその高札はしばしば崩れているので、防御的なパーサの鎖が、崩れた札をそっとnullにする。他所の島の事情を、責めずに受け流す作り。

## 見どころ

- 本堂の中の一角(packages/fedify/src/nodeinfo、約2000行)。client.ts / handler.ts / types.ts の三枚
- Protocolは文字列リテラルのunion——activitypubだけでなく、diaspora、ostatus、xmppなど旧い宇宙の名前も並んでいる

## 経文の一節

{% sutra path="packages/fedify/src/nodeinfo/client.ts" lines="L306-L318" note="旧い宇宙の名前たちが、まだ台帳に残っている" repo="fedify" %}
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
