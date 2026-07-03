## Fedify

ActivityPub サーバーを作るための TypeScript フレームワーク。連合まわりの面倒を引き受けてくれます。

[icon:scale] MIT · [icon:code] TypeScript · [icon:house] [fedify.dev](https://fedify.dev) · [icon:git-branch] [Repo](https://github.com/fedify-dev/fedify)

### なぜ存在するか

現場の ActivityPub には、署名の仕組みが四つある——HTTP リクエスト用に二つ、ドキュメント用に二つ。JSON はサーバーごとに形を変え、配達は順不同で届き、仕様書のどこにも書かれていないサーバー固有の癖まである。fedify は、その面倒をまるごと引き受けて、扱いやすい既定値に変えてくれる。著者自身が書いたフィールドガイドが、その痛みの正体を教えてくれる： [Why ActivityPub is hard](https://hackers.pub/@fedify/2026/why-activitypub-is-hard)。

### こんな人に

- [icon:rocket] **TypeScript か JavaScript で、新しく連合アプリをつくる人** — fedify の本領がいちばん出るところ。Ghost、Hollo、Hackers' Pub が本番で動かしている。
- [icon:puzzle] **すでにあるアプリを、連合対応にしたい人** — Express、 Hono、Next.js、SvelteKit ほか、十以上のフレームワーク統合がある。
- [icon:braces] **JSON-LD を手で書くのに疲れた人** — 型つきの語彙だけでも、採用する価値がある。
- [icon:book-open] **他の言語で実装している人** — 出力が決定的だから、バイト単位で一致する模範解答になる。

### いいところ

- [icon:sliders-horizontal] 連合の中核はまるごと、**ひとつのオプションオブジェクト**——Hollo ではおよそ二十数行で書かれている。
- [icon:inbox] inbox は、**ひとつのルーティングテーブル**——ハンドラーが動く前に、署名はもう検証済み。
- [icon:user-round] actor は、**データベースの一件の参照**——WebFinger、 NodeInfo、鍵の公開までついてくる。
- [icon:send] フォロワー全員への配達は、**呼び出しひとつ**——fan-out、リトライ、順序保証も込み。

:::card
[icon:heart-handshake] [使い心地](/build/fedify/feels-good) — Hollo と Hackers' Pub の実例つきで
:::

### 道のり

連合は段階を追って育つ。ひとつ確かめてから、次へ進める——見つかる → フォローされる → 話す → 聞く → やり取りする → 一人前になる。最初の三段階は薄く、四段階目に本当の仕事がある。

:::card
[icon:milestone] [ロードマップ](/build/fedify/roadmap) — 六つの段階とチェックポイント、そして道がどこまで続くか
:::

### 心にとめておくこと

- [icon:database] **永続化は、あなたの仕事** — fedify は何も保存しない。リモートの actor や投稿を写し取るのが、本当の仕事になる。
- [icon:gavel] **ポリシーも、あなたの仕事** — フォローを受け入れるか、モデレーション、削除をどう扱うか。
- [icon:triangle-alert] **鋭い落とし穴もある** — 不変な語彙、`Object` の名前被り、クロスオリジンの再取得、二種類の鍵。

:::card
[icon:triangle-alert] [心にとめておくこと](/build/fedify/watch-out) — 落とし穴の数々と、それぞれの出典
:::

### 運用

- [icon:split] web と worker、プロセスを分ける。
- [icon:shield-check] 安全装置は、外さない。
- [icon:terminal] デバッグは CLI で、lint はエディタで。

:::card
[icon:wrench] [運用](/build/fedify/running) — 運用と、デバッグと、どこから始めるか
:::

### あわせて読みたい

:::cards
- [icon:map] **Why ActivityPub is hard** — fedify が引き受けてくれる面倒の正体を、著者自身が書いたフィールドガイド — [hackers.pub](https://hackers.pub/@fedify/2026/why-activitypub-is-hard)
- [icon:git-branch] **コードを読む** — 一晩かけて読む価値がある、本番稼働中の fedify コードベース — [Hollo](https://github.com/fedify-dev/hollo) [Hackers' Pub](https://github.com/hackers-pub/hackerspub)
- [icon:notebook-pen] **fedify を使って、fedify を卒業した話** — fedify を本番で使い、そして卒業するまでの記録 — [blog.atfedi.de](https://blog.atfedi.de/ja/leaving-fedify)
:::
