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

この海が、フェディバース(fediverse)そのものです。マストドン大陸も、ミスキー群島も、この博物街の三つの島も、みんな同じ海に面していて、同じ作法で文(ふみ)をやり取りします。その作法がActivityPub——W3Cが2018年に勧告した、連合SNSの共通儀典です。

船が運ぶ外交文書は、Activityと呼ばれるJSON-LDの包みです。「フォローします(Follow)」「これを作りました(Create)」「いいねです(Like)」。差出人のinboxからoutboxへ、封蝋にはHTTP署名——本文が改竄されていないこと、たしかにその島の主が出したものであることを、受け取った側が検められるように。

## 見どころ

- 宛先の解決は、いつも[webfingerの門](/ja/section/fedify/rooms/webfinger/)から。「@handle@host」という名前が、まずactorのURLに引かれる
- 文書は素のJSONではなくJSON-LD。語彙の意味は`@context`が担ぐ——だから船は、辞書ごと運んでいる
- 封蝋(HTTP署名)には新旧二つの作法があって、fedifyの[儀典の間](/ja/section/fedify/rooms/sig/)は相手に合わせて使い分ける
- 返事は来ないのが普通(fire-and-forget)。届いたかどうかはHTTPの応答コードだけが教えてくれる
