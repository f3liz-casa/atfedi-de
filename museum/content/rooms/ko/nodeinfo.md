---
name: "nodeinfo 알림판"
kind: "fedify 본섬"
repo: "fedify"
plain: "\"이 서버는 어떤 소프트웨어이고, 몇 명이 사는지\"를 내거는 자기소개 표예요."
related: [webfinger, fedify-honden]
files:
  - path: "packages/fedify/src/nodeinfo/client.ts"
    what: "getNodeInfo()와, 너그러운 parse* 사슬"
  - path: "packages/fedify/src/nodeinfo/handler.ts"
    what: "알림판을 세우는 쪽(handleNodeInfo/handleNodeInfoJrd)"
  - path: "packages/fedify/src/nodeinfo/types.ts"
    what: "NodeInfo/Software/Protocol 타입"
links:
  - label: "이 알림판을 GitHub에서 보기"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/fedify/src/nodeinfo"
---

서버의 자기소개를 우주가 읽을 수 있는 모양으로 내걸 수 있어요. 어떤 소프트웨어이고 몇 명이 사는지 — fedi 통계 사이트에 내 섬이 실리는 건 이 알림판 덕분이에요. 세우는 것도 읽는 것도 각각 함수 하나면 돼요.

읽는 쪽의 방식이 이 방의 볼거리예요. 남의 알림판은 자주 망가져 있어서, 방어적인 파서가 사슬로 이어져 망가진 표를 살며시 null로 둬요. 다른 섬의 사정을 탓하지 않고 흘려보내는 만듦새죠.

## 볼거리

- 본당 안의 한 구석이에요(packages/fedify/src/nodeinfo, 약 2000줄). client.ts / handler.ts / types.ts 세 장이죠
- Protocol은 문자열 리터럴 union이에요 — activitypub뿐 아니라 diaspora, ostatus, xmpp처럼 옛 우주의 이름도 나란히 있어요

## 경문 한 구절

{% sutra path="packages/fedify/src/nodeinfo/client.ts" lines="L306-L318" note="옛 우주의 이름들이 아직 장부에 남아 있어요" repo="fedify" %}
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
