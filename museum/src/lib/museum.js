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

// 部屋のkind文字列から、どの島に居るか。kindは言語で変わるので、
// 三言語ぶんの目印語で見分ける(対訳表 docs/terms-i18n.md が根拠)
const MARKS = [
  { key: 'hollo', color: '#B0714F', marks: ['hollo', 'Hollo'] },
  { key: 'hp', color: '#5E7B5A', marks: ['hackers.pub'] },
  { key: 'math', color: '#B8860B', marks: ['数学', 'Mathematics', '수학'] },
  { key: 'sea', color: '#5F8D88', marks: ['外交', 'Diplomacy', '외교'] },
  { key: 'oki', color: '#68808C', marks: ['沖', 'Offshore', '앞바다'] },
];

export function islandOf(kind) {
  for (const isle of MARKS) {
    if (isle.marks.some((m) => kind.includes(m))) return isle;
  }
  return { key: 'fedify', color: '#68808C' };
}
