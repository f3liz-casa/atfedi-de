# 記事を出すまで — ブランチ → push → プレビュー → マージ → デプロイ

blog.atfedi.de に記事を出すときの、いつもの道すじ。書く内容の指針は
[`writing.md`](./writing.md)（三言語の重心）と
[`translation-ko.md`](./translation-ko.md)（韓国語）に。ここは運びかたの話だけ。

## 全体図

```
下書き(.mdoc) → ローカルbuild → ブランチにcommit & push
    → /v/preview/{branch}/-/{lang}/{slug} で推敲
    → main にマージ → clean worktree から deploy → 本番確認
```

プレビューは **GitHub のブランチを直接読む**ので、push するだけで映る。
デプロイは記事が main に入ってから、最後に一度だけ。

## 1. 下書き

置き場所は言語ごとに一枚ずつ:

```
blog/src/content/posts/{ja,en,ko}/{slug}.mdoc
```

frontmatter は `title` / `description` / `date` / `author`。原稿でよく踏む穴:

- **一段落は一行で書く**。段落内のハード改行は、CJK では文字間の隙間になる。
- **CJK の太字は、閉じ `**` の直前を約物にしない**。直前が「。」や「)」で
  直後が CJK 文字だと、閉じが効かず崩れる。約物を外に出す:
  `**〜こと。**連合` → `**〜こと**。連合`、
  `**정문선(초록)**은` → `**정문선**(초록)은`。
- en / ko は翻訳ではなく transcreation。長さも構造も違ってよい
  （→ `writing.md`）。

## 2. 手元で確かめる

```sh
npm run build --workspace blog
```

これで Markdoc が通るか（frontmatter の欠け・構文の崩れ）まで分かる。
見た目も見たければ `npm run dev --workspace blog`。
**CSS や レイアウトを触った場合はここが本番前の唯一の確認場所**
（後述のとおり、プレビューにはスタイル変更が映らない）。

## 3. ブランチにして push

```sh
git switch -c blog/{slug}
git add blog/src/content/posts/*/{slug}.mdoc
git commit && git push -u origin blog/{slug}
```

- ブランチ名は `blog/{slug}` が慣例。スラッシュは URL を壊さない。
- **`pr-` で始まる名前だけは付けない**（プレビューが PR 番号と読み違える。
  理由の詳細は [CONTRIBUTING](../CONTRIBUTING.md#naming-your-branch)）。

## 4. プレビューで推敲

```
https://blog.atfedi.de/v/preview/{branch}/-/{lang}/{slug}
```

仕組みと、知っておくとよいこと:

- ページは Worker が **GitHub の raw content をその場で読んで** SSR する。
  ビルドも再デプロイも要らず、push が反映のすべて。
- ref の解決は 30 秒キャッシュされる。push 直後は最大 30 秒、前の版が
  出ることがある。あわてず一呼吸。
- **CSS / JS はデプロイ済みのものを使う**。スタイルやレイアウトの変更は
  プレビューに映らない（§2 のローカル確認で）。本文の推敲には十分。
- どのプレビューページも `noindex`。検索には載らない。
- PR を開いたなら `pr-{number}` も ref に使える。

推敲はここで済ませる。直しては push、を好きなだけ。ko はできれば
公開前に一度、ネイティブの目を通す（→ `translation-ko.md` 冒頭の注記）。

## 5. main にマージ

読み終わって、直すところが無くなったら:

```sh
git switch main
git merge blog/{slug}
git push
```

マージしただけでは、まだ本番には出ない。

## 6. clean worktree からデプロイ

```sh
git worktree add --detach /tmp/atfedi-deploy main
cd /tmp/atfedi-deploy
npm ci
npm run deploy        # 全 workspace build → wrangler deploy
cd - && git worktree remove /tmp/atfedi-deploy
```

作業ツリーから直接 deploy しないのは、**そこに居る別の未公開下書きや
untracked ファイルを巻き込まない**ため。worktree は main のコミットだけを
持つので、出るものはいつも「main に入っているもの」と一致する。
`npm run deploy` は wrangler の認証（`wrangler login` 済みか
`CLOUDFLARE_API_TOKEN`）が要る。

## 7. 本番確認

```sh
for l in ja en ko; do
  curl -s -o /dev/null -w "%{http_code} $l\n" \
    "https://blog.atfedi.de/$l/{slug}"
done
```

三言語とも 200 が返って、目でも一度読めたら、おしまい。
