---
name: "조회실(graphql)"
kind: "hackers.pub 관"
repo: "hp"
plain: "새 화면을 위해 데이터를 물어보는 창구(GraphQL)예요."
related: [hp-models, hp-web]
files:
  - path: "graphql/builder.ts"
    what: "플러그인 아홉 장과 관세, drizzle 되붙이기 패치"
  - path: "graphql/mod.ts"
    what: "각 영역을 부수효과 import로 모아 toSchema()"
  - path: "graphql/server.ts"
    what: "Yoga 서버. Bearer → 세션 문맥 만들기"
  - path: "graphql/post.ts"
    what: "한 권의 postTable이 세 얼굴로 변하는 곳"
links:
  - label: "이 동을 GitHub에서 보기"
    href: "https://github.com/hackers-pub/hackerspub/tree/main/graphql"
---

화면이 원하는 데이터를, 원하는 모양으로, 한 번에 물어볼 수 있어요. 새 화면을 만들 때마다 서버에 새 창구를 부탁하지 않아도 돼요 — 다음 관(web-next)이 어떤 모습이 되어도, 이 조회실이 답해요.

가장 큰 볼거리는, 같은 postTable이 Note, Article, Question이라는 세 얼굴로 변한다는 점이에요. 장부는 한 권인데, 조회 창으로 보면 세 종류의 자료로 보이는 거죠.

## 볼거리

- 권한은 scope-based예요. signed(세션 있음)와, 장부를 뒤져 확인하는 async한 moderator죠
- 물음의 무게에 관세가 있어요 — 익명은 깊이 11·복잡도 20000까지, 서명한 쪽은 20·25000까지죠
- drizzle-orm rc.2의 버릇(getTableConfig의 기본키 열이 다른 인스턴스를 돌려줘요)을, 이름으로 되붙이는 솔직한 패치가 builder.ts에 있어요
- 영역마다 한 건 한 파일(account.ts, post.ts, poll.ts, moderation.ts……)+딸린 테스트예요

## 경문 한 구절

{% sutra path="graphql/builder.ts" lines="L213-L224" note="플러그인 아홉 장의 겹쳐 입기" repo="hp" %}
```typescript
export const builder = new SchemaBuilder<PothosTypes>({
  plugins: [
    ComplexityPlugin,
    RelayPlugin,
    ScopeAuthPlugin,
    DrizzlePlugin,
    DataloaderPlugin,
    SimpleObjectsPlugin,
    TracingPlugin,
    WithInputPlugin,
    ErrorsPlugin,
  ],
```
{% /sutra %}
