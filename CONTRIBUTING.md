# Contributing

## ブランチの名前

`pr-` で始まるブランチは **作りません**。

ライブプレビュー（`blog.atfedi.de/v/preview/{ref}/-/{lang}/{slug}`）は、
`{ref}` が `pr-123` のとき「プルリクエスト #123」と解釈します。`pr-` で
始まるブランチが存在しないことで、この解釈は曖昧になりません。

ブランチは `pr-` 以外の名前で。スラッシュを含んでも構いません
（`/v/preview/` は ref と content path を `/-/` で区切るため）。

## ブログ記事のプレビュー

記事は `blog/src/content/posts/{lang}/{slug}.mdoc`。push 済みのブランチ、
または開いている PR を、ビルド前にそのまま見られます:

```
https://blog.atfedi.de/v/preview/{branch}/-/{lang}/{slug}
https://blog.atfedi.de/v/preview/pr-{number}/-/{lang}/{slug}
```

プレビューは「本番に十分近いもの」で、Astro ビルドと 1:1 ではありません。
すべて noindex です。
