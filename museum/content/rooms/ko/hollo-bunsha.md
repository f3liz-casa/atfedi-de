---
name: "fedify 별원(npm 판본)"
kind: "hollo 경내 · 별원"
repo: hollo
plain: "hollo 안에 들어 있는, fedify 라이브러리 그 자체(npm에서 받은 사본)예요."
related: [sig, fedify-honden]
files:
  - path: package.json
    what: "@fedify/*의 여덟 권, 전부 ^2.3.0"
  - path: src/index.tsx
    what: "federation() 미들웨어 한 줄의 건널 복도"
  - path: src/federation/federation.ts
    what: "관에 하나뿐인 createFederation()"
links:
  - label: "총본산(fedify 본섬)으로"
    href: https://github.com/fedify-dev/fedify
  - label: "npm 판본 목록"
    href: https://www.npmjs.com/package/@fedify/fedify
---

`npm install` 하나로, 이 관의 외교가 전부 손에 들어왔어요 — 그게 이 탑이에요. package.json에 @fedify/\*의 경전이 여덟 권, 나란히 갖춰져 있어요.

별원과 관의 이음매는 딱 한 줄이에요. `app.use(federation(fedi, ...))`. 게다가 라우터들보다 앞에 서니까, `/@handle`이라는 같은 주소가 찾는 방식에 따라 fedify의 얼굴도 사랑방의 얼굴도 돼요. 그런데 이 관의 문패는 `@fedify/hollo` — 별원과 총본산이 같은 성을 쓰고 있는 거죠.

## 볼거리

- createFederation()은 관에서 딱 한 번이에요(`src/federation/federation.ts`). 그다음은 모두가 같은 인스턴스를 돌려 봐요
- @fedify/vocab의 어휘(Accept/Announce/Create/EmojiReact/Follow/Like/Move/QuoteRequest……)를, 코드 곳곳에서 곧바로 import해요
- 검색(v2 search)도, lookupObject/isActor를 @fedify/vocab을 거쳐 써요

## 경문 한 구절

{% sutra path="src/index.tsx" lines="L69-L76" note="이 한 줄이, 별원과 관을 잇는 건널 복도예요. 라우터들보다 먼저 서요" repo="hollo" %}
```typescript
app.use(federation(fedi, (_) => undefined));

app.route("/", pages);
app.route("/oauth", oauth);
app.route("/api", api);
app.route("/image", image);
app.route("/proxy", proxy);
```
{% /sutra %}
