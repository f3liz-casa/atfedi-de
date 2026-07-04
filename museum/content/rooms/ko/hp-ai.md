---
name: "신관(ai)"
kind: "hackers.pub 관"
repo: "hp"
plain: "이미지 설명문 만들기나 번역처럼, AI 실험 기능을 모은 동이에요."
related: [hp-models, hp-graphql]
files:
  - path: "ai/mod.ts"
    what: "공개하는 기능 전부(네 가지)"
  - path: "ai/moderation.ts"
    what: "조항마다의 확신도와 이유. 판결은 하지 않아요"
  - path: "ai/summary.ts"
    what: "로케일 협상이 딸린 요약"
  - path: "ai/prompts"
    what: "로케일별 Markdown 프롬프트 선반"
links:
  - label: "이 동을 GitHub에서 보기"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/ai"
---

이미지에 설명문이 붙고, 긴 글이 요약되고, 게시물이 번역돼요 — 읽고 쓰는 문턱을 낮추는 도구로, AI가 딱 네 가지만 일해요.

그리고 선을 긋는 방식이 볼거리예요. moderation의 벽에는 "이건 사람 모더레이터를 위한 참고 자료이지, 자동 판결이 아니다"라고 적혀 있어요. 확신도와 이유를 붙여 돌려줄 뿐이에요. 판단은, 사람의 몫 그대로예요.

## 볼거리

- 프롬프트는 로케일별 Markdown이에요(ai/prompts/). import할 때 readdir로 주워서, 요청 언어에 가장 가까운 걸 negotiate해요
- 의존은 models→ai 한 방향이에요. 그래서 ai는 CocProvision을 스스로 베껴서 가지고 있어요 — 동의 독립을 지키기 위한, 작은 사경이죠

## 경문 한 구절

{% sutra path="ai/summary.ts" lines="L10-L15" note="프롬프트 선반을, 기동할 때 소리 내어 읽어요" repo="hp" %}
```typescript
const PROMPT_LANGUAGES: Locale[] = (
  await readdir(
    join(import.meta.dirname!, "prompts", "summary"),
    { withFileTypes: true },
  )
).map((f) => f.name.replace(/\.md$/, "")).filter(isLocale);
```
{% /sutra %}
