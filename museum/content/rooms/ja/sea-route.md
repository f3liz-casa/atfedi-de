---
name: "外交航路"
kind: "外交の海"
plain: "連合SNSどうしが手紙をやり取りする共通ルール——ActivityPubの海です。"
related: [webfinger, sig, fedify-honden, relay]
links:
  - label: "ActivityPub (W3C勧告)"
    href: "https://www.w3.org/TR/activitypub/"
  - label: "ActivityStreams 2.0 語彙"
    href: "https://www.w3.org/TR/activitystreams-vocabulary/"
---

この海があるから、別々の会社の、別々の個人の、別々のソフトが、同じタイムラインでつながれます。Mastodonからholloの人をフォローできるのも、hackers.pubの記事がMisskeyに流れてくるのも、ぜんぶこの共通の儀典——ActivityPub——のおかげ。

船が運ぶ外交文書は、Activityと呼ばれるJSON-LDの包みです。「フォローします(Follow)」「これを作りました(Create)」。封蝋にはHTTP署名——たしかにその島の主が出したものだと、受け取った側が検められるように。

## 見どころ

- 宛先の解決は、いつも[webfingerの門](/ja/section/fedify/rooms/webfinger/)から。「@handle@host」という名前が、まずactorのURLに引かれる
- 文書は素のJSONではなくJSON-LD。語彙の意味は`@context`が担ぐ——だから船は、辞書ごと運んでいる
- 封蝋(HTTP署名)には新旧二つの作法があって、fedifyの[儀典の間](/ja/section/fedify/rooms/sig/)は相手に合わせて使い分ける
- 返事は来ないのが普通(fire-and-forget)。届いたかどうかはHTTPの応答コードだけが教えてくれる
