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

宛名ひとつで、宇宙じゅうの誰でも見つけられます。「@friend@mastodon.social」と書けば、相手がどのサーバに住んでいても、あなたのアプリはほんとうの住所(URL)を引けます。自分で作るなら `lookupWebFinger()` を一回呼ぶだけ——電話帳の仕組みそのものは、覚えなくてもだいじょうぶ。

この包みは「訪ねる側」の半分だけです。訪ねられたときに /.well-known/webfinger で答える側は、本堂に住んでいます。門は、外へ出ていく人のためのもの。

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
