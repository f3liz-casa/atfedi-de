# atfedi.de — アーキテクチャと構築プラン

atfedi.de は、二つの「世界」と、ひとつのプレビュー機構からなる。すべて
Cloudflare 上で、ひとつの Worker がホスト名で振り分ける。

## 全体図

```
atfedi.de                      → 言語を感知して {locale}.atfedi.de へ
{locale}.atfedi.de             → カタログ（ロケール・サブドメイン）
   en.  ja.  ko.  ja-x-oita. … ロケール = BCP 47 タグの開いた集合
blog.atfedi.de                 → ブログ（別世界・パス方式の i18n）
   /{lang}/{slug}                  日常記事・多言語
   /v/{slug}                       dev 記事・英語のみ（atfedi.de/v → "dev"）
   /v/preview/{ref}/-/{...path}    ライブプレビュー
```

## 二つの世界 — なぜ i18n の形が違うか

**原則: その i18n が「全言語そろった鏡」か「不揃い」かで、仕組みを選ぶ。**

- **カタログ** — 全ツールが全言語に並んで存在する（parallel mirror）。
  ロケールはきれいな直交軸 → **サブドメイン**。
- **ブログ** — 記事ごとに在る言語が不揃い（日常記事は多言語、dev は英語の
  み）。不揃いな i18n はサブドメインに載らない → **パス**。

ロケールは「BCP 47 タグの開いた集合」として扱う。`en` `ja` `ko`
`ja-x-oita`（大分弁、`-x-` は私用サブタグ）… すべて等価な「ロケール・
サブドメイン」で、Worker も Astro も区別しない。方言を増やす構造コストは
ほぼゼロ — 重いのは中身（翻訳）だけ。

## 配信モデル — Worker ＋ Static Assets

いまの Pages プロジェクトを、Worker ＋ Static Assets に一本化する。ひとつの
Worker が、ビルド成果物をアセットとして抱え、ホスト名で世界を振り分ける。

```
host = atfedi.de            /{lang}/* は 301 で {lang}.atfedi.de へ
                            それ以外は Accept-Language を見て 302
host = {locale}.atfedi.de   カタログ: assets の catalog/{locale}/* を返す
host = blog.atfedi.de       /v/preview/{ref}/-/{path} はライブレンダラへ
                            それ以外は assets の blog/* を返す
共通アセット（/_astro/ など）はロケール接頭辞なしで返す
```

## リポジトリ構成 — モノレポ

カタログとブログは別の Astro プロジェクト。ひとつのモノレポに収め、
**一回の deploy で両方を同時に publish** する。

```
atfedi-de/
  catalog/   Astro（いまのサイトをここへ移す）
  blog/      新規 Astro ＋ @astrojs/markdoc
  worker/    Cloudflare Worker ＋ wrangler.jsonc
  shared/    tokens.css / base.css / components.css（workspace パッケージ）
  docs/      プロジェクト全体のドキュメント（ルートに残す）
  package.json   ルート — npm workspaces ＋ orchestration スクリプト
```

- 道具は **npm workspaces**（npm 内蔵、追加ツールなし）。`shared/` は小さな
  workspace パッケージにし、catalog も blog も import する（相対パスの
  `../../../` を避ける）。
- **同時 publish の仕組み** — catalog と blog の Astro `outDir` を、それぞれ
  `dist/catalog`・`dist/blog` に向ける。両ビルドがひとつの `dist/` に直接
  書き込まれ、Worker の `assets` はその `dist/` を指す。`npm run build`
  （両方ビルド）→ `wrangler deploy`（一回）で、二つの世界がアトミックに
  本番へ出る。ブログだけ／カタログだけの個別 publish はしない（意図どおり）。

## フェーズ

独立して出せる順に。各フェーズの終わりで、本番が一段進む。

### フェーズ 0 — モノレポ化（✓ 完了）

いまのカタログを `catalog/` に移し、ルートに npm workspaces を設定。
`shared/` に CSS を切り出し、catalog がそこから import するよう変更。
`docs/` はルートに残す。
→ verify: `npm run build` でカタログが従来どおりビルドできる

### フェーズ 1 — カタログをロケール・サブドメインに（✓ 完了）

カタログは既に動いている。これは自己完結で、単体で出せる。

1. **URL層を改修** — ナビ・言語スイッチャ・canonical・og・hreflang から
   `/{lang}/` 接頭辞を外す。言語間リンクは `https://{l}.atfedi.de/...` の
   絶対URLに。ルートの redirect ページ `src/pages/index.astro` は削除
   （apex は Worker 担当に）。
   → verify: `npm run build`、各言語のリンク・canonical を確認
2. **Worker v1** — `{locale}.atfedi.de` をアセットに割り当て、apex を言語
   感知＋リダイレクト、`atfedi.de/{lang}/*` を 301。`wrangler.jsonc` に
   assets バインディングと routes。
   → verify: `ja.atfedi.de/use/` が日本語、apex が振り分け、旧パスが 301
3. **切り替え** — `wrangler deploy`。`atfedi.de` を Pages プロジェクトから
   外し、Worker のカスタムドメインへ（← ダッシュボード作業）。`en/ja/ko`
   サブドメインは wrangler が `custom_domain` で DNS ごと自動作成。
   → verify: 本番で全サブドメインが正しい言語

### フェーズ 2 — ブログ（✓ 完了）

1. `blog/` に新規 Astro ＋ `@astrojs/markdoc`。記事は content collection
   （`.mdoc`）＋ Zod スキーマ（カタログのツールと同じパターン）。`shared/`
   の CSS を import。
2. ルーティング — 言語別ホーム `/{lang}/`、記事 `/{lang}/{slug}`。記事は
   ヘッダの言語スイッチャ（カタログと同じ作り）で行き来する。スイッチャは
   その記事に実在する翻訳だけを出す。dev 記事も日常記事に合流させ、`/v/`
   はプレビュー専用に空けた。
3. コードハイライト（Shiki、Markdoc 統合の設定）。RSS（`@astrojs/rss`）は
   要るときに。
4. **Worker v2** — `blog.atfedi.de` を blog のアセットに割り当て。素の `/`
   は Accept-Language を見て `/{lang}/` へ。
   → verify: `blog.atfedi.de/ja/...` が出る、スイッチャが翻訳の有無に従う

### フェーズ 3 — ライブプレビュー（✓ 完了）

`blog.atfedi.de/v/preview/{ref}/-/{...path}`

1. **Worker v3** — `/v/preview/...` を専用ハンドラへ:
   - `{ref}` が `pr-{数字}` → GitHub API で PR を解決（`head.repo` ＋
     `head.sha` を使う。PR は fork 由来のことがある）
   - それ以外 → ブランチ名。`/-/` が ref と content path を区切る
   - GitHub から `.mdoc` を fetch → `@markdoc/markdoc`（コア）で render。
     これは Worker 内で動く
   - **スキーマ厳格・生HTML不許可**で render（PR の中身は信頼できないため。
     ここで Markdoc を選んだことが効く）
   - `{ref} → SHA` は短いキャッシュ、中身は SHA で長いキャッシュ
   - `/v/preview/*` に `X-Robots-Tag: noindex`
   - 描画は「本番に十分近いプレビュー」。Astro ビルドと 1:1 ではない
2. リポジトリは公開なので、GitHub への問い合わせは匿名でも通る。`env.
   GITHUB_TOKEN` を `wrangler secret` で入れれば API レート上限が上がる
   （任意 — 入れなければ匿名の毎時 60 回）。
3. 約束 — **`pr-` で始まるブランチは作らない**。CONTRIBUTING に明記する。
   → verify: ブランチと PR、両方プレビューできる

実装は `worker/preview.js`（ディスパッチャ `index.js` から `/v/preview/`
で呼ぶ）。frontmatter は数行の素朴なパーサで読む。Markdoc の既定
トークナイザは markdown-it を `html: false` で生成する → 生HTMLは
テキストにエスケープされる。キャッシュは subrequest の `cf.cacheTtl` で
二段に — ブランチ解決は 30 秒、SHA 固定の中身は 1 日。

## あなたの手が要るところ

- フェーズ 1 の切り替えで、`atfedi.de` を Pages プロジェクトから外す一手
  （ダッシュボード）。同じホスト名を Pages と Worker の両方には付けられない
  ため。
- それ以外（Astro 改修、Worker、`wrangler` 設定、サブドメインの DNS、
  デプロイ）は CLI から進められる。

## スコープ外（このプランで作らないもの）

- 個別ツールページ（`/use/misskey-tools` の単体ページ）。カタログは lane
  ページ ＋ カードのまま。
- ブログ記事の中身。仕組みだけ。
- `ja-x-oita` など方言の翻訳された中身。仕組みは最初から許すが、中身は人手。
