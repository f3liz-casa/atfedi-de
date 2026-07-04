// 地図の口上書き(札のキャプション)と、カメラの止まり場所

export const ISLE = {
  fedify: [80, 430, 1200],
  bridges: [560, 420, 1150], // 橋は島の東端: 右の札に隠れないよう視点を東へ
  hollo: [1380, 900, 700],
  hp: [1410, 140, 780],
  sea: [900, 100, 1300],
  math: [880, 433, 1100],
};

export const GOTO = {
  'fedify-isle': ISLE.fedify,
  'hollo-isle': ISLE.hollo,
  'hp-isle': ISLE.hp,
};

export function focusOf(id) {
  if (id === 'welcome') return null;
  if (id === 'bridges') return ISLE.bridges;
  if (id === 'relay' || id === 'sea-route') return ISLE.sea;
  if (id.startsWith('hollo-')) return ISLE.hollo;
  if (id.startsWith('hp-')) return ISLE.hp;
  if (id.startsWith('math-')) return ISLE.math;
  return ISLE.fedify;
}

const GH_F = 'https://github.com/fedify-dev/fedify/tree/main/';
const GH_H = 'https://github.com/fedify-dev/hollo/tree/main/';
const GH_P = 'https://github.com/hackers-pub/hackerspub/tree/main/';

export const DATA = {
  welcome: { kind: 'ごあんない', name: 'フェディの博物街へ、ようこそ',
    body: 'これは fedify・hollo・hackers.pub という三つのオープンソースを、歩いて回れる博物街にしたページです。地図はつまんで動かせて、目印を押すと近づきます。白い小さな丸が、まだ見ていない展示。見ると朱の印に変わります。はじめての方は、門のそばの「案内所」からどうぞ。夜になるレンズは、最後のお楽しみに。',
    links: [['はじめてのActivityPub(案内所)', '/section/fedify/rooms/guide/'], ['ことばの栞', '/section/fedify/rooms/kotoba/']] },
  guide: { kind: 'ごあんない', name: '案内所',
    body: 'はじめてのActivityPubの方は、ここからどうぞ。一通の文(ふみ)が海を渡るまでを、七つの部屋づたいに案内します。ことばに迷ったときの栞も置いてあります。',
    links: [['ことばの栞', '/section/fedify/rooms/kotoba/']] },
  'fedify-honden': { kind: 'fedify 本島・本堂', name: '連合の間',
    body: 'fedifyの心臓部。Federationオブジェクトがここに座っていて、inboxに届いた文書の受付、outboxからの発送、アクターの台帳をぜんぶ采配します。holloもhackers.pubも、この間取りをそのまま自分の館に写しています。',
    links: [['この間をGitHubで見る', GH_F + 'packages/fedify/src/federation']] },
  sig: { kind: 'fedify 本島', name: '儀典の間',
    body: '文書に印を捺し、届いた印を検める部屋。HTTP Message Signatures(RFC 9421)と旧いdraft-cavage、二つの作法を相手に合わせて使い分けます(double-knock)。FEP-8b32のObject Integrity Proofsもここ。レンズをかけると、この部屋の床下に糸が見えます。',
    links: [['この間をGitHubで見る', GH_F + 'packages/fedify/src/sig']] },
  vocab: { kind: 'fedify 本島', name: '語彙の経蔵',
    body: 'Note、Follow、Like……ActivityStreamsの語彙が、TypeScriptの型として一語ずつ経文になって納まっている経蔵。写経は手ではなくコード生成で、Activity Vocabularyの仕様から一字ずつ書き写されます。',
    links: [['この蔵をGitHubで見る', GH_F + 'packages/vocab']] },
  webfinger: { kind: 'fedify 本島・一の門', name: 'webfinger の門',
    body: '島の一の門。「@handle@host」という名前から、actorの住所(URL)を引きます。連合宇宙でだれかを訪ねる旅は、かならずこの門をくぐるところから始まります。',
    links: [['この門をGitHubで見る', GH_F + 'packages/webfinger']] },
  nodeinfo: { kind: 'fedify 本島', name: 'nodeinfo 高札場',
    body: '「このサーバは何者で、住人は何人か」を書いて掲げる高札。よその島の統計局が、ときどき読みに来ます。',
    links: [['この高札をGitHubで見る', GH_F + 'packages/fedify/src/nodeinfo']] },
  kura: { kind: 'fedify 本島', name: '倉の区画',
    body: 'postgres・redis・sqlite・mysql・denokv の倉と、amqp の飛脚小屋。fedifyはKvStoreとMessageQueueという同じ形の口を決めていて、どの倉をつないでも本殿は同じ顔で動きます。',
    links: [['倉の並びをGitHubで見る', GH_F + 'packages']] },
  kobo: { kind: 'fedify 本島', name: '道具の工房',
    body: 'fedify CLI と debugger の工房。init で新しい島の縄張りを引き、lookup でよそのactorを照会し、debuggerで届いた文書の中身を覗きます。旅人(開発者)むけの道具屋です。',
    links: [['CLIの工房', GH_F + 'packages/cli'], ['debuggerの棚', GH_F + 'packages/debugger']] },
  bridges: { kind: 'fedify 本島・東岸', name: '十四の橋',
    body: 'hono、express、fastify、koa、h3、elysia、nestjs、next、nuxt、sveltekit、fresh、astro、solidstart、cfworkers。どのフレームワークの岸にも、同じ形の橋が架かります。holloは hono の橋を渡って本島に着きます。',
    links: [['橋の一覧をGitHubで見る', GH_F + 'packages']] },
  relay: { kind: '沖の岩', name: 'relay 灯台',
    body: '一対一で文通するかわりに、灯台がまとめて預かって配って回る中継所。小さな島どうしが、灯台ごしにつながります。',
    links: [['この灯台をGitHubで見る', GH_F + 'packages/relay']] },
  'sea-route': { kind: '外交の海', name: '外交航路',
    body: 'ActivityPubという共通の儀典で書かれた外交文書(Activity)が、船で行き交う海。宛先はマストドン大陸、ミスキー群島、その先の無数の島々。船が運ぶのはJSON-LD、封蝋はHTTP署名です。',
    links: [['儀典の原文(W3C勧告)', 'https://www.w3.org/TR/activitypub/']] },
  'hollo-pages': { kind: 'hollo 館・3F', name: '客間',
    body: '玄関先の公開プロフィールと投稿ページ。訪ねてきた人が、最初に通されるところ。',
    links: [['この階をGitHubで見る', GH_H + 'src/pages']] },
  'hollo-api': { kind: 'hollo 館・2F', name: '受付(Mastodon API)',
    body: 'v1/v2の窓口。手持ちのMastodonアプリがここに話しかけると、holloが中でぜんぶ翻訳します。だから引っ越しても、いつものアプリのまま住めます。',
    links: [['この階をGitHubで見る', GH_H + 'src/api']] },
  'hollo-fed': { kind: 'hollo 館・1F', name: '外交室',
    body: 'fedify別院に常駐してもらい、外の宇宙との文通をぜんぶ任せている部屋。届いた文書はここで検められて、館の台帳に写されます。',
    links: [['この階をGitHubで見る', GH_H + 'src/federation']] },
  'hollo-oauth': { kind: 'hollo 館・離れ', name: '鍵の間',
    body: 'アプリに合鍵(トークン)を切って渡す離れ。合鍵がないと、受付は取り次いでくれません。',
    links: [['この離れをGitHubで見る', GH_H + 'src/oauth']] },
  'hollo-bunsha': { kind: 'hollo 境内・別院', name: 'fedify 別院(npm蔵版)',
    body: 'npmの蔵版から写経、^2.3.0。node_modulesに写しとして納まっているのに、だれもただの複製とは呼びません——同じ経が、ここで生きて読まれている。灯を分けても、元の火は減りません。総本山と同じ経文であることを、確かめに行ってもいいです。',
    links: [['総本山(fedify本島)へ', 'https://github.com/fedify-dev/fedify'],
      ['npm蔵版の目録', 'https://www.npmjs.com/package/@fedify/fedify']] },
  'hp-web': { kind: 'hackers.pub 館', name: '閲覧室(web)',
    body: 'Freshのroutesとislands。「島(islands)」という言葉が、この館では建築用語です。読む人のための、いちばん大きな部屋。',
    links: [['この棟をGitHubで見る', GH_P + 'web']] },
  'hp-graphql': { kind: 'hackers.pub 館', name: '照会室(graphql)',
    body: '次の館(web-next)のためのGraphQL窓口。尋ねごとを一枚の紙(query)に書いて出すと、必要なぶんだけ返ってきます。',
    links: [['この棟をGitHubで見る', GH_P + 'graphql']] },
  'hp-models': { kind: 'hackers.pub 館', name: '書庫(models)',
    body: 'ドメインモデルの書庫。館じゅうの棟が、ここの台帳を共有しています。',
    links: [['この棟をGitHubで見る', GH_P + 'models']] },
  'hp-fed': { kind: 'hackers.pub 館', name: '外交室(federation)',
    body: 'inbox宛の文書を、fedify別院が検めてから台帳に写す部屋。holloの外交室と、同じ間取りをしています——同じ経で建てられているからです。',
    links: [['この棟をGitHubで見る', GH_P + 'federation']] },
  'hp-ai': { kind: 'hackers.pub 館', name: '新館(ai)',
    body: 'AIの実験棟。まだ増築中の匂いがします。',
    links: [['この棟をGitHubで見る', GH_P + 'ai']] },
  'hp-bunsha': { kind: 'hackers.pub 境内・別院', name: 'fedify 別院(JSR蔵版)',
    body: 'こちらはJSRの蔵版から写経、2.3.1。holloの別院と版木がちがうのに、経の中身は同じです。バージョンの数字は、書写した年号のようなもの。大蔵経に高麗蔵や嘉興蔵があったように、同じ正典に版がいくつかあるのです。',
    links: [['総本山(fedify本島)へ', 'https://github.com/fedify-dev/fedify'],
      ['JSR蔵版の目録', 'https://jsr.io/@fedify/fedify']] },
  'math-ec': { kind: '数学の隠れ街', name: '楕円曲線の工房',
    body: 'Ed25519。Curve25519という曲線の上で点を足し算すると、偽造できない印鑑ができます。儀典の間の署名は、床下のこの工房で捺されています。使うだけなら知らなくていい。知っていると、印鑑が透けて見える。',
    links: [['床上の儀典の間', GH_F + 'packages/fedify/src/sig']] },
  'math-prime': { kind: '数学の隠れ街', name: '素数の井戸',
    body: 'RSA。大きな素数を二つ掛けるのは一瞬、積から割り戻すのは千年。井戸は、深いほうへ落ちるのは簡単で、登るのが難しい。古い井戸ですが、まだ現役です。',
    links: [] },
  'math-hash': { kind: '数学の隠れ街', name: '一方通行の扉',
    body: 'SHA-256。どんな長さの文書も、この扉を通ると32バイトの影になります。影から文書へは、戻れません。文書が一文字ちがえば、影はまるで別物。外交文書のdigestは、この扉の判子です。',
    links: [] },
  'math-graph': { kind: '数学の隠れ街', name: 'グラフの書庫',
    body: 'JSON-LDの正準化(RDF Dataset Canonicalization)。「書き方がちがうだけで、意味は同じ文書」に同じ名前を与えるため、グラフに正準なラベルを振ります。地味な顔をして、かなり深い問題です。',
    links: [] },
  'math-logic': { kind: '数学の隠れ街', name: '論理の神殿',
    body: 'TypeScriptの型。Curry–Howard対応でいえば、型検査が通ることは、小さな証明が通ること。語彙の経蔵の一語一語は、この神殿で裏書きされています。',
    links: [] },
};
