## 運用

fedify アプリを「連合できる」から「本番で動く」へ引き上げる習慣—— それぞれに、扱っているマニュアルページを添えて。

**web と worker を分ける**。 HTTP はひとつのプロセスで受け、キューは `manuallyStartQueue` + `startQueue` で別のプロセスに任せる。Hollo も Hackers' Pub も、遅い連合処理がユーザー向けリクエストを圧迫した経験から、この形に落ち着いた。[manual/mq](https://fedify.dev/manual/mq) · [manual/deploy](https://fedify.dev/manual/deploy)。

**プロキシの裏では、origin を固定する**。書き換えられた内部の Host ではなく、公開 URL に対して署名が検証されるよう、`origin` オプション（または `x-forwarded-fetch` ミドルウェア）を設定する。 [manual/federation](https://fedify.dev/manual/federation)。

**安全装置は、外さない**。署名検証は既定でオンになっていて（[manual/inbox](https://fedify.dev/manual/inbox#signature-verification)）、ドキュメントローダーはプライベートアドレスを拒む（[manual/federation § allowPrivateAddress](https://fedify.dev/manual/federation#allowprivateaddress)）。どちらも「動いているように見える」と「安全である」の境界線——緩めていいのはテストの中だけ（[manual/test](https://fedify.dev/manual/test)）。

**デバッグは CLI で、lint はエディタで**。 `fedify lookup` はどんなリモートオブジェクトも覗ける。`fedify inbox` は使い捨ての inbox を、 `fedify tunnel` は開発サーバーを HTTPS 越しに見せてくれる（[CLI リファレンス](https://fedify.dev/cli)）。`@fedify/lint` プラグインは、鍵ペアの設定漏れや、何も配達しない outbox リスナーといった相互運用の間違いを、書いている最中に見つけてくれる（[manual/lint](https://fedify.dev/manual/lint)）。そして、チーム専用の ActivityPub デバッガー [DrFed](https://drfed.org/) も、近く登場する。

**はじめは API リファレンスではなく、チュートリアルから**。 [basics tutorial](https://fedify.dev/tutorial/basics) と [federated microblog](https://fedify.dev/tutorial/microblog) が、道のり全体を歩いてくれる。エディタの AI に読ませるなら、 [llms.txt](https://fedify.dev/llms.txt) もある。

---

[icon:arrow-left] [Fedifyに戻る](/build/fedify)
