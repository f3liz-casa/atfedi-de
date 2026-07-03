## 心にとめておくこと

二つのリスト——fedify があえて任せている仕事と、見つかった鋭い落とし穴。それぞれに、出典を添えて。

## 自分の仕事として残るもの——設計として

fedify はプロトコル層であって、アプリケーションではない。Hollo と Hackers' Pub を並べて読むと、アプリ側の本当の仕事がどこにあるか、驚くほど一致している：

**永続化**。 fedify は語彙オブジェクトを手渡すだけで、何も保存しない。リモートの actor や投稿を自分のデータベースに写し取ることが、 Hackers' Pub では連合コードのいちばん大きな塊になっている（`persistActor`、`persistPost`——注意深い upsert が何千行も）。初日から、そのつもりで予算を組んでおくこと。

**ポリシー**。 `manuallyApprovesFollowers` が変えるのは鍵アイコンだけ ——Follow を自動で `Accept` するかどうかは、自分の inbox ハンドラーが決めること（[manual/pragmatics](https://fedify.dev/manual/pragmatics)）。モデレーションも同じ：リモートの actor を解決する*前に*、自分のブロックリストを確認する。`Delete(Actor)` を素直に受け入れる前にも、一度考えたい——Hackers' Pub は処分済みの actor をあえて残していて、リモートの actor が自分を削除するだけでモデレーションの証拠を消せないようにしている。

**副作用**。通知、タイムライン、カウンター——これらはすべて、自分のハンドラーの中で行う app 側の fan-out。fedify には受信側の冪等性キャッシュがある（[manual/inbox](https://fedify.dev/manual/inbox#activity-idempotency)）が、それでも両アプリとも、データベースへの書き込みは upsert で安全にしている。

**失敗の後始末**。 fedify はリトライしたのち、恒久的な配達失敗を報告してくれる——それが何を意味するかを決めるのは自分の仕事。404 ならフォローを剪定し、`410 Gone` ならアカウントごとカスケード削除する、といった判断が `setOutboxPermanentFailureHandler` （[manual/send](https://fedify.dev/manual/send#error-handling)）に入る。

## 鋭い落とし穴、そしてその出典

二つのコードベースを読んで見つけた落とし穴（いくつかは、自分たちでも踏んだ）。それぞれに、警告が書かれているページを添えて：

**`Object` と `Image` は、JS の組み込みと名前が被る**。エイリアスをつけて import する（`Object as ASObject`）か、半日を失うか。 [manual/vocab](https://fedify.dev/manual/vocab) の冒頭で警告されていて、両方のコードベースにも痕跡がある。

**語彙オブジェクトは不変**。構築したあとのプロパティ代入はできない ——`.clone({ … })` で作り直す。 [manual/vocab § Immutability](https://fedify.dev/manual/vocab#immutability)。

**クロスオリジンの埋め込みオブジェクトは、既定で再取得される**。安全だけれど、boost や quote のたびに往復が発生し、元のサーバーが落ちていれば失敗する。Hollo は、アクティビティの署名がすでに payload を保証している十数箇所で `crossOrigin: "trust"` を渡している。このトレードオフは、 [manual/vocab § Origin-based security model](https://fedify.dev/manual/vocab#origin-based-security-model) に。

**アクティビティの `id` を、`(actor, object)` から導き出さない**。 Follow → Undo → Follow は、三つの異なるアクティビティ——UUID を埋め込むこと。 [manual/send § Specifying an activity](https://fedify.dev/manual/send#specifying-an-activity)。

**両方の鍵タイプを生成すること**。 Mastodon は RSA の HTTP 署名しか検証しない一方、Ed25519 は Object Integrity Proofs のために使われる。 [manual/actor § Public keys](https://fedify.dev/manual/actor#public-keys-of-an-actor)。

**署名ネゴシエーションは、生きた互換性のつまみ**。 Hollo と Hackers' Pub は今、特定の相手実装と噛み合わせるために `firstKnock: "draft-cavage-http-signatures-12"` を固定していて、いずれ戻すつもりの TODO も残っている。特定のサーバーとだけ連合がうまくいかないときは、まずこのつまみを疑うといい。オプションは [manual/federation](https://fedify.dev/manual/federation) に。

**引用投稿は、まだ最前線**。 fedify は FEP-044f の語彙（`QuoteRequest`、`QuoteAuthorization`、インタラクションポリシー）を運んでくれるけれど、引用を描画しないサーバー向けの `RE: <url>` インライン HTML フォールバックは、両アプリとも手作りしている。 Hackers' Pub はさらに、取り込み時に Misskey のインライン引用マークアップを取り除いている。これは、マニュアルには*書かれていない* ——Hackers' Pub の `federation/inbox/quote.ts` と `models/html.ts` を読むこと。

**キューのハンドラータイムアウトは、ハンドラーを止めてくれない**。遅いリモート fetch はタイムアウトを超えて生き延び、データベース接続を握ったままになりうる。Hackers' Pub は、永続化の再帰処理全体に自前の `AbortSignal` 予算を通して、リモート fetch すべてに枠をはめている。これもマニュアルには載っていない——Hackers' Pub の `models/post.ts` にある長いコメントが、いちばん詳しい解説。

---

[icon:arrow-left] [Fedifyに戻る](/build/fedify) ·
[icon:arrow-right] [運用](/build/fedify/running)
