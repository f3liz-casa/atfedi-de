---
name: "新館(ai)"
kind: "hackers.pub 館"
repo: "hp"
plain: "画像の説明文づくりや翻訳など、AIの実験機能の棟です。"
related: [hp-models, hp-graphql]
files:
  - path: "ai/mod.ts"
    what: "公開している能力の全部(四つ)"
  - path: "ai/moderation.ts"
    what: "条項ごとの確度と理由。判決はしない"
  - path: "ai/summary.ts"
    what: "ロケール折衝つきの要約"
  - path: "ai/prompts"
    what: "ロケール別Markdownのプロンプト棚"
links:
  - label: "この棟をGitHubで見る"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/ai"
---

画像に説明文がつき、長文が要約され、投稿が翻訳されます——読み書きの垣根を下げる道具として、AIが四つだけ働いています。

そして線の引き方が見どころです。moderationの壁には「これは人間のモデレーターのための参考資料で、自動の判決ではない」と書いてある。確度と理由を添えて返すだけ。判断は、人の仕事のまま。

## 見どころ

- プロンプトはロケール別のMarkdown(ai/prompts/)。importの時にreaddirで拾い、リクエストの言語にいちばん近いものをnegotiateする
- 依存はmodels→aiの一方通行。だからaiはCocProvisionを自前に写して持つ——棟の独立を保つための、小さな写経

## 経文の一節

{% sutra path="ai/summary.ts" lines="L10-L15" note="プロンプトの棚を、起動のときに読み上げる" repo="hp" %}
```typescript
const PROMPT_LANGUAGES: Locale[] = (
  await readdir(
    join(import.meta.dirname!, "prompts", "summary"),
    { withFileTypes: true },
  )
).map((f) => f.name.replace(/\.md$/, "")).filter(isLocale);
```
{% /sutra %}
