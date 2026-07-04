// 博物街の共通の台帳: 順路、蔵版(リポジトリ)のURL、島の見分け

export const GH = {
  fedify: 'https://github.com/fedify-dev/fedify/blob/main/',
  hollo: 'https://github.com/fedify-dev/hollo/blob/main/',
  hp: 'https://github.com/hackers-pub/hackerspub/blob/main/',
};

// 順路(門から入って、島づたいに、最後に隠れ街へ降りる)
export const ORDER = [
  'webfinger', 'fedify-honden', 'sig', 'vocab', 'nodeinfo', 'kura', 'kobo', 'bridges', 'relay',
  'sea-route',
  'hollo-pages', 'hollo-api', 'hollo-fed', 'hollo-oauth', 'hollo-bunsha',
  'hp-web', 'hp-graphql', 'hp-models', 'hp-fed', 'hp-ai', 'hp-bunsha',
  'math-ec', 'math-prime', 'math-hash', 'math-graph', 'math-logic',
];

// 部屋のkind文字列から、どの島に居るか(島ごとの屋根色つき)
export function islandOf(kind) {
  if (kind.startsWith('hollo')) return { key: 'hollo', label: 'hollo 館', color: '#B0714F' };
  if (kind.startsWith('hackers.pub')) return { key: 'hp', label: 'hackers.pub 館', color: '#5E7B5A' };
  if (kind.startsWith('数学')) return { key: 'math', label: '数学の隠れ街', color: '#B8860B' };
  if (kind.startsWith('外交')) return { key: 'sea', label: '外交の海', color: '#5F8D88' };
  if (kind.startsWith('沖')) return { key: 'oki', label: '沖の岩', color: '#68808C' };
  return { key: 'fedify', label: 'fedify 本島', color: '#68808C' };
}
