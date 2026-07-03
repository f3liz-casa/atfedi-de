## 使い心地

fedify をいちばんよく知る方法は、著者自身が書いた二つの本番コードベースを読むこと——単一ユーザー向けマイクロブログの [Hollo](https://github.com/fedify-dev/hollo)、そして複数ユーザー向けブログプラットフォームの [Hackers' Pub](https://github.com/hackers-pub/hackerspub)。どちらでも、次のことが言える：

**連合の中核は、まるごとひとつのオプションオブジェクト**。 Hollo の `createFederation` 呼び出し——KV ストア、リトライ付き Postgres キュー、署名ネゴシエーション、SSRF ポリシー、トレーシング——は、わずか二十数行（`src/federation/federation.ts`）。手で組み立てるなら、配達パイプラインと署名レイヤー、そして自分で保守する鍵キャッシュになっていたはず。

**inbox は、ひとつのルーティングテーブル**。 Hollo は十五種類のアクティビティを、`.on(Follow, …).on(Create, …)` というおよそ八十行で配線している。ハンドラーが動く頃には、HTTP 署名の検証は fedify がもう済ませていて、型つきのオブジェクトが手元にある。Hollo 全体で署名まわりに書かれたコードは、たった一つ——tombstone 化された actor という特殊なケースのために、fedify がすでに行った検証を*あえて外す*、小さなフックだけ。

**actor は、データベースの一件の参照**。 DB の行から組み立てた `Person` を返すだけでよく、コンテントネゴシエーション、WebFinger、 NodeInfo のルーティング、JSON-LD の `@context` / `publicKey` / `assertionMethod` ブロックは、すべて fedify 側の問題。鍵ペアディスパッチャーは保存済みの JWK を返すだけ——RSA と Ed25519 の両方を公開し、相手ごとに正しいほうを選ぶのは fedify の仕事。

**フォロワー全員への配達は、呼び出しひとつ**。 `ctx.sendActivity(user, "followers", activity, { preferSharedInbox: true })`。どちらのアプリも、inbox を列挙したり、shared inbox を重複排除したり、リトライや backoff のコードを書いたりはしていない。順序保証は分散システムの設計問題ではなく、`orderingKey` というオプションひとつに収まっている。

**コレクションは、カーソルの作法**。 followers コレクションは、およそ四十行——`{ items, nextCursor }` を返す、範囲指定つきの SQL クエリだけ。`OrderedCollection` のページや `next`、`totalItems` は、 fedify が組み立てて返してくれる。

---

[icon:arrow-left] [Fedifyに戻る](/build/fedify) ·
[icon:arrow-right] [心にとめておくこと](/build/fedify/watch-out)
