---
name: "webfinger の門"
kind: "fedify 本島・一の門"
repo: "fedify"
plain: "「@名前@どこの島」という宛名から、その人のほんとうの住所(URL)を調べる電話帳です。"
related: [fedify-honden, nodeinfo, sea-route]
files:
  - path: "packages/webfinger/src/lookup.ts"
    what: "lookupWebFinger()クライアント"
  - path: "packages/webfinger/src/jrd.ts"
    what: "JRDの型: ResourceDescriptorとLink"
links:
  - label: "この門をGitHubで見る"
    href: "https://github.com/fedify-dev/fedify/tree/main/packages/webfinger"
---

島の一の門です。「@handle@host」という名前を、actorの住所(URL)に引く——連合宇宙で誰かを訪ねる旅は、かならずここをくぐるところから始まります。

包みとしては小さくて、公開の入口は lookupWebFinger() の一本だけ。返ってくるのはJRD(JSON Resource Descriptor)という札で、subject(名前)、aliases(別名)、links(この人のactor文書はこちら、という道標)が書いてあります。

おもしろいのは、この包みが「訪ねる側」の半分だけだということ。訪ねられたとき /.well-known/webfinger で答える側は、本堂(federation/webfinger.ts)に住んでいます。門は、外へ出ていく人のためのもの。

## 見どころ

- 全体で1400行ほど。島でいちばん小さな包みのひとつ
- 公開玄関は lookupWebFinger()(lookup.ts)ただ一つ。LookupWebFingerOptionsで振る舞いを調整
- jrd.ts の ResourceDescriptor と Link が、WebFingerの返す札の形そのもの

## 経文の一節

{% sutra path="packages/webfinger/src/jrd.ts" lines="L5-L9" note="門で受け取る札の形" repo="fedify" %}
```typescript
export interface ResourceDescriptor {
  subject?: string;
  aliases?: string[];
  properties?: Record<string, string | null>;
  links?: Link[];
```
{% /sutra %}

## さわってみる

{% toy id="webfinger" /%}
