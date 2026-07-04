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
