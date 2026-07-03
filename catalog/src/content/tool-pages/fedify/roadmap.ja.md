## ロードマップ

連合は、ひとつの機能ではない。段階を追って育つもので、それぞれの段階は独立して確かめられる。ここでは、その道のり全体を高いところから見わたす ——六つの段階、それぞれに fedify が引き受けること、自分で書くこと、そして実際に動かして確認できるチェックポイントがある。最初の三段階は薄く、四段階目に、アプリケーションとしての本当の仕事がある。

### 1. [icon:search] 見つかる

web フレームワークに `createFederation(...)` をひとつ差し込み、ユーザーテーブルから `Person` を返す actor ディスパッチャーと、保存済みの JWK を返す鍵ペアディスパッチャーを用意する。

- **fedify が引き受けること** — WebFinger、コンテントネゴシエーション、 actor の JSON-LD（`@context`、`publicKey`、`assertionMethod`）、 NodeInfo のルーティング、RSA と Ed25519 両方の鍵生成。
- **自分で書くこと** — データベースの参照と、ユーザーごとに二つの JWK を保管する場所。
- **チェックポイント** — Mastodon から `@you@your.domain` を検索して、プロフィールが表示される。`fedify lookup @you@your.domain` で actor が見える。
- Docs: [tutorial/basics](https://fedify.dev/tutorial/basics) · [manual/actor](https://fedify.dev/manual/actor)

### 2. [icon:user-plus] フォローされる

inbox のリスナー——はじめての `.on(Follow, …)`。

- **fedify が引き受けること** — ハンドラーが動く前の署名検証、型つきディスパッチ、`Accept` への署名と配達。
- **自分で書くこと** — フォロワーの永続化、`Accept` の送信、そして自動承認か承認待ちにするかのポリシー判断（`manuallyApprovesFollowers` はただのラベルで、決めるのは自分のコード）。
- **チェックポイント** — Mastodon アカウントから自分をフォローすると、「リクエスト中」から「フォロー中」に変わり、followers コレクションが 1 件になる。
- Docs: [manual/inbox](https://fedify.dev/manual/inbox) · [manual/collections](https://fedify.dev/manual/collections)

### 3. [icon:megaphone] 話す

はじめての送信、`Create(Note)`。

- **fedify が引き受けること** — `sendActivity` の呼び出しひとつでフォロワー全員への fan-out、shared-inbox の重複排除、backoff つきのリトライ、配達順序（`orderingKey`）、outbox コレクションの体裁。
- **自分で書くこと** — 投稿のモデル、その HTML、メンションとハッシュタグを `tag` として表現すること。
- **チェックポイント** — 投稿すると、フォロワーの Mastodon タイムラインに届く。試行錯誤のあいだは、`fedify inbox` が使い捨てのフォロワーを用意してくれる。
- Docs: [manual/send](https://fedify.dev/manual/send) · [tutorial/microblog](https://fedify.dev/tutorial/microblog)

### 4. [icon:ear] 聞く——ここが本丸

ネットワークから届く `Create` を受け取り、写し取る——リモートの actor や投稿をデータベースの行として、タイムラインや通知として。

- **fedify が引き受けること** — どんな形の JSON からも型つきオブジェクトを取り出すこと、ドキュメントローダー、埋め込みオブジェクトのクロスオリジン検証。
- **自分で書くこと** — 写し取る仕組みそのもの：`persistActor`、 `persistPost`、返信のスレッド化、タイムラインへの fan-in、通知。これは意図的に fedify の仕事ではなく、読んだどのアプリでも連合コードのいちばん大きな塊になっている。時間の多くは、ここに割くことになる。
- **チェックポイント** — Mastodon からの返信が自分のアプリに現れ、正しい投稿の下にスレッドとしてつながり、正しいユーザーに通知が届く。
- Docs: [manual/vocab](https://fedify.dev/manual/vocab)——自分の設計にとりかかる前に、[Hackers' Pub](https://github.com/hackers-pub/hackerspub) の `persistPost` を読んでおくといい。

### 5. [icon:repeat] やり取りする

会話としての動詞を、両方向に——`Like`、`Announce`、`Update`、`Delete`、 `Undo`。

- **fedify が引き受けること** — 語彙と配達のすべて。受信側の冪等性キャッシュも。
- **自分で書くこと** — upsert で安全な状態遷移、取り消し処理（`Undo(Like)` は本当に like を取り除く）、判断をともなう削除—— モデレーションの証拠を消してしまう `Delete(Actor)` は、既定値ではなく決断であるべき。
- **チェックポイント** — like と boost が両方向で往復する。投稿を編集すると `Update` が Mastodon 側にも反映され、削除すると向こうでも消える。
- Docs: [manual/pragmatics](https://fedify.dev/manual/pragmatics)—— それぞれの動詞が、Mastodon 上で実際どう表示されるか。

### 6. [icon:server] 一人前になる

「連合できる」から、「ちゃんと動く」へ。

- **fedify が引き受けること** — 差し替え可能なメッセージキュー、リトライポリシー、サーキットブレーカー、恒久的な失敗の報告、 authorized fetch と instance actor、OpenTelemetry トレーシング。
- **自分で書くこと** — worker プロセスの分離（`manuallyStartQueue` と `startQueue`）、失敗の後始末（404 なら剪定、`410 Gone` ならカスケード削除）、モデレーションとブロックのチェック、監視ダッシュボード。
- **チェックポイント** — manual/deploy の [公開前チェックリスト](https://fedify.dev/manual/deploy) を、上から下まで。
- Docs: [manual/mq](https://fedify.dev/manual/mq) · [manual/access-control](https://fedify.dev/manual/access-control) · [manual/opentelemetry](https://fedify.dev/manual/opentelemetry)

## [icon:telescope] 見晴らし——道はどこまで続くか

ここまでは、すべてマイクロブログの話。同じ六段階が、fedify の語彙とエコシステムの知見を携えたまま、この先にも伸びていく：

- [icon:notebook-pen] **長文の記事** — 多言語コンテンツと markdown の `Source` を持つ `Article`。Hackers' Pub は、ブログ記事をまるごと連合させている。
- [icon:braces] **投票** — `Question`、返信としての投票、締め切り時の `Update`。
- [icon:heart-handshake] **絵文字リアクション** — `EmojiReact` とカスタム `Emoji`、Misskey 系譜の作法。Hollo は両方を話せる。
- [icon:map] **引用投稿** — インタラクションポリシーを伴う、FEP-044f の `QuoteRequest` / `QuoteAuthorization`——まだ最前線。 [心にとめておくこと](/build/fedify/watch-out) を参照。
- [icon:footprints] **アカウント移行** — `Move`、フォロワーの転送、エイリアス。参照した二つのコードベースはどちらも対応済み。
- [icon:gavel] **通報** — サーバー間の `Flag`。Mastodon が期待する挙動も織り込み済み。
- [icon:send] **リレー** — 購読して、提供する。[CLI](https://fedify.dev/cli) の `fedify relay` と [manual/relay](https://fedify.dev/manual/relay)。
- [icon:split] **どんなランタイムでも** — Deno、Node、Bun。十以上の web フレームワーク。サーバーレスまで届く KV とキューのアダプター。

そして、この見晴らしの正直な縁も伝えておく——永続化、タイムライン、通知、メディアストレージ、クライアントアプリとその API は、決して fedify の仕事にならない。それは、あなたのアプリケーションの仕事。その境界線は、 [心にとめておくこと](/build/fedify/watch-out) にきっちり引かれている。

## [icon:book-open] 道すがらの FEP

FEP——[Fediverse Enhancement Proposals](https://w3id.org/fep/)——は、フェディバースが実際どう動いているかを共有するノートで、仕様書より一段くだけている。fedify はそのかなりの数を実装していて、正式な一覧は [FEDERATION.md](https://github.com/fedify-dev/fedify/blob/main/FEDERATION.md) にある。この道のりで実際に出会うのは、次のもの：

- **段階 1、見つかる** — [FEP-521a](https://w3id.org/fep/521a) （actor が公開鍵をどう公表するか）と [FEP-8b32](https://w3id.org/fep/8b32)（Object Integrity Proofs—— Ed25519 によるドキュメント署名）が、fedify が二つの鍵ペアを持たせる理由。[FEP-f1d5](https://w3id.org/fep/f1d5) は NodeInfo。
- **段階 2、フォローされる** — [FEP-8fcf](https://w3id.org/fep/8fcf) は follower コレクションをサーバー間で同期させ、 [FEP-5feb](https://w3id.org/fep/5feb) は、まっとうなサーバーがユーザーを検索インデックスに載せる前に確認する、同意のフラグ。
- **段階 4、聞く** — [FEP-fe34](https://w3id.org/fep/fe34) は、 [心にとめておくこと](/build/fedify/watch-out) で出会ったクロスオリジン再取得の既定挙動を支える、origin ベースのセキュリティモデル。
- **見晴らしの先** — 絵文字リアクションは [FEP-c0e0](https://w3id.org/fep/c0e0)。引用投稿は [FEP-e232](https://w3id.org/fep/e232)（オブジェクトリンク）と [FEP-044f](https://w3id.org/fep/044f)（同意を尊重する引用）の組み合わせ。リレーは [FEP-ae0c](https://w3id.org/fep/ae0c) を話す。アカウントのエクスポートは [FEP-9091](https://w3id.org/fep/9091) に乗る。
- **そして、あなたのための FEP** — [FEP-67ff](https://w3id.org/fep/67ff) が言うことは、ただひとつ：連合の挙動を `FEDERATION.md` に書き残すこと。fedify 自身も一つ持っている。自分のサーバーが一人前になったら、あなたも一つ持つといい。

---

[icon:arrow-left] [Fedifyに戻る](/build/fedify) ·
[icon:arrow-right] [心にとめておくこと](/build/fedify/watch-out)
