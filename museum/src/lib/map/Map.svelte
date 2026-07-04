<script>
  import { onMount, onDestroy } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { ui } from '$lib/ui.svelte.js';
  import { visited, markVisited, resetVisited } from '$lib/visited.svelte.js';
  import { t } from '$lib/i18n.js';
  import LangSwitch from '$lib/components/LangSwitch.svelte';
  import { ISLE, GOTO, focusOf } from './data.js';
  import { CAPTIONS as CJA } from './captions.ja.js';
  import { CAPTIONS as CEN } from './captions.en.js';
  import { CAPTIONS as CKO } from './captions.ko.js';

  let { available = [], lang = 'ja' } = $props();

  const DATA = { ja: CJA, en: CEN, ko: CKO }[lang] ?? CJA;
  const T = t(lang);
  const L = T.map.labels;
  const SEC = `/${lang}/section/fedify`;

  const NS = 'http://www.w3.org/2000/svg';
  const W = 2400, H = 1600;

  let svgEl;
  let sel = $state(null);          // いま開いている札のid(welcome含む)
  let firstStamp = $state(false);  // この札がはじめての御朱印か
  const TOTAL = Object.keys(DATA).length - 1; // welcomeは数えない
  const stamps = $derived(visited.ids.filter((id) => DATA[id] && id !== 'welcome').length);

  const selData = $derived(sel ? DATA[sel] : null);

  // 板の幅の見積り(CJKは幅広、ラテンは細め)
  const est = (s) =>
    [...s].reduce((a, ch) => a + (ch.codePointAt(0) > 0xff ? 11.5 : 6.8), 0);

  let reduced = false;
  let markers = {};
  let selEls = [];
  let BEADS = [];
  let beadRAF = null;
  let animId = null;
  let cam = { x: 0, y: 0, w: W };

  /* ---------- 描く道具 ---------- */
  function E(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    (parent || svgEl).appendChild(el);
    return el;
  }
  function txt(x, y, str, cls, size, parent, anchor) {
    const t = E('text', { x, y, class: cls, 'font-size': size, 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = str;
    return t;
  }
  // シード付き乱数: 海岸線は毎回おなじ海岸線
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let gWave, gLand, gDeco, gShadow, gBuild, gThreads, gMath, gShips, gLbl, gSign, gMark;

  function blob(cx, cy, rx, ry, seed, parent, cls) {
    const r = rng(seed), n = 16, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, j = 0.82 + 0.34 * r();
      pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
    }
    let d = 'M' + (pts[0][0] + pts[1][0]) / 2 + ',' + (pts[0][1] + pts[1][1]) / 2;
    for (let i = 1; i <= n; i++) {
      const p = pts[i % n], q = pts[(i + 1) % n];
      d += ' Q' + p[0] + ',' + p[1] + ' ' + (p[0] + q[0]) / 2 + ',' + (p[1] + q[1]) / 2;
    }
    return E('path', { d: d + 'Z', class: cls || 'f-land sw' }, parent || gLand);
  }
  function shadow(cx, cy, rx) { E('ellipse', { cx, cy, rx, ry: rx * 0.3, class: 'f-shadow' }, gShadow); }
  function house(x, y, w, h, roof, id, opt) {
    opt = opt || {};
    const g = E('g', id ? { 'data-id': id } : {}, gBuild), rh = h * 0.42;
    shadow(x + w / 2, y + h + 4, w * 0.62);
    E('rect', { x, y: y + rh, width: w, height: h - rh, class: 'f-wall sw', rx: 2 }, g);
    E('path', { d: `M${x - 5},${y + rh} L${x + w / 2},${y} L${x + w + 5},${y + rh} Z`,
      fill: `var(${roof})`, stroke: 'var(--ink)', 'stroke-width': 1.5, class: 'sw' }, g);
    if (!opt.noDoor) E('rect', { x: x + w / 2 - 5, y: y + h - 16, width: 10, height: 16, class: 'f-ink sw', rx: 1 }, g);
    if (opt.plateTxt) {
      const pw = est(opt.plateTxt) + 12;
      E('rect', { x: x + w / 2 - pw / 2, y: y + rh + 7, width: pw, height: 16,
        fill: 'var(--wall)', stroke: 'var(--ink)', 'stroke-width': 1, class: 'sw' }, g);
      txt(x + w / 2, y + rh + 19.5, opt.plateTxt, 'lbl sw', 11, g);
    }
    return g;
  }
  function pagoda(x, y, s, id) { // 三重塔。屋根の朱は fedify の居る印
    const g = E('g', { 'data-id': id }, gBuild);
    shadow(x, y + s, s * 0.55);
    E('rect', { x: x - 1.5, y: y + s * 0.1, width: 3, height: s * 0.31, fill: 'var(--ink)', class: 'sw' }, g);
    for (let i = 0; i < 3; i++)
      E('circle', { cx: x, cy: y + s * 0.14 + i * s * 0.07, r: 2.5, fill: 'var(--shu)',
        stroke: 'var(--ink)', 'stroke-width': 1, class: 'sw' }, g);
    const tier = (cy, bw, rw) => {
      E('rect', { x: x - bw, y: cy, width: bw * 2, height: s * 0.14, class: 'f-wall sw' }, g);
      E('path', { d: `M${x - rw},${cy} L${x - rw * 0.25},${cy - s * 0.09} L${x + rw * 0.25},${cy - s * 0.09} L${x + rw},${cy} Z`,
        fill: 'var(--shu)', stroke: 'var(--ink)', 'stroke-width': 1.2, class: 'sw' }, g);
    };
    tier(y + s * 0.41, s * 0.14, s * 0.24);
    tier(y + s * 0.6, s * 0.17, s * 0.29);
    tier(y + s * 0.79, s * 0.2, s * 0.34);
    E('rect', { x: x - s * 0.3, y: y + s * 0.92, width: s * 0.6, height: s * 0.08, class: 'f-wall sw' }, g);
    return g;
  }
  function tree(x, y, s) {
    E('rect', { x: x - 1.5, y: y - s * 0.3, width: 3, height: s * 0.3, fill: '#8A7B5C', class: 'sw' }, gDeco);
    E('circle', { cx: x, cy: y - s * 0.55, r: s * 0.34, class: 'f-tree sw' }, gDeco);
    E('circle', { cx: x - s * 0.2, cy: y - s * 0.42, r: s * 0.24, class: 'f-tree2 sw' }, gDeco);
  }
  function grove(cx, cy, n, seed, spread) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) tree(cx + (r() - 0.5) * spread, cy + (r() - 0.5) * spread * 0.6, 26 + r() * 18);
  }
  function road(d) { E('path', { d, class: 'f-path sw' }, gDeco); }
  function hall(x, y, w, h, roof, title, floors) {
    const g = E('g', {}, gBuild);
    shadow(x + w / 2, y + h + 5, w * 0.6);
    E('path', { d: `M${x - 7},${y} L${x + w / 2},${y - h * 0.3} L${x + w + 7},${y} Z`,
      fill: `var(${roof})`, stroke: 'var(--ink)', 'stroke-width': 1.5, class: 'sw' }, g);
    const fh = h / floors.length;
    floors.forEach((f, i) => {
      const fy = y + i * fh;
      const room = E('g', { 'data-id': f.id }, g);
      E('rect', { x, y: fy, width: w, height: fh, class: 'f-wall sw' }, room);
      txt(x + 10, fy + fh / 2 + 4, f.label, 'lbl sm sw', 13, room, 'start');
      txt(x + w - 10, fy + fh / 2 + 4, f.code, 'mono lbl-soft sm sw', 10, room, 'end');
    });
    E('rect', { x, y, width: w, height: h, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2, class: 'sw' }, g);
    txt(x + w / 2, y - h * 0.3 - 12, title, 'name sw', 26, gLbl);
    return g;
  }
  function ship(g) {
    E('path', { d: 'M-22,0 L22,0 L14,12 L-14,12 Z', fill: '#8A7B5C',
      stroke: 'var(--ink)', 'stroke-width': 1.3, class: 'sw' }, g);
    E('rect', { x: -2, y: -26, width: 3, height: 26, fill: 'var(--ink)', class: 'sw' }, g);
    E('path', { d: 'M1,-26 Q16,-16 1,-4 Z', fill: 'var(--wall)',
      stroke: 'var(--ink)', 'stroke-width': 1.2, class: 'sw' }, g);
  }
  function signpost(x, y, label, dest) {
    const g = E('g', { 'data-goto': dest, class: 'signpost' }, gSign);
    const pw = est(label) + 18;
    E('ellipse', { cx: x, cy: y + 2, rx: 14, ry: 4, class: 'f-shadow' }, g);
    E('rect', { x: x - 2.5, y: y - 26, width: 5, height: 26, fill: '#8A7B5C',
      stroke: 'var(--ink)', 'stroke-width': 1.2, class: 'sw' }, g);
    E('rect', { x: x - pw / 2, y: y - 46, width: pw, height: 21, rx: 2, fill: 'var(--wall)',
      stroke: 'var(--ink)', 'stroke-width': 1.4, class: 'sw' }, g);
    txt(x, y - 31, label, 'lbl sw', 12, g);
  }
  function addMarker(id, x, y, parent) {
    const g = E('g', { 'data-id': id, class: 'mkr', transform: `translate(${x},${y})` }, parent);
    const s = E('g', { class: 'mk' }, g);
    E('circle', { class: 'ring', r: 10.5 }, s);
    E('circle', { class: 'base', r: 5.5 }, s);
    E('circle', { class: 'core', r: 3 }, s);
    markers[id] = g;
  }

  /* ---------- 場面をぜんぶ建てる ---------- */
  function buildScene() {
    E('rect', { x: -2000, y: -2000, width: W + 4000, height: H + 4000, class: 'f-sea sw' });
    gWave = E('g', { class: 'surface' }); gLand = E('g', {}); gDeco = E('g', { class: 'surface' });
    gShadow = E('g', { class: 'surface' }); gBuild = E('g', { class: 'surface' });
    gThreads = E('g', { id: 'gThreads' }); gMath = E('g', { id: 'gMath' });
    gShips = E('g', { class: 'surface' }); gLbl = E('g', { class: 'surface' });
    gSign = E('g', { class: 'surface' });

    blob(640, 830, 470, 390, 7);
    blob(1730, 1130, 300, 225, 21);
    blob(1790, 420, 330, 245, 33);
    blob(1062, 352, 52, 36, 44);

    { const r = rng(99);
      for (let i = 0; i < 70; i++) {
        const x = r() * W, y = r() * H;
        E('path', { d: `M${x},${y} q7,-6 14,0 q7,6 14,0`, class: 'f-wave sw', opacity: 0.5 }, gWave);
      } }

    // fedify 本島
    road('M620,1180 C620,1080 600,1000 600,900');
    road('M600,900 C520,900 460,900 410,930');
    road('M600,900 C700,900 780,910 830,930');
    road('M600,860 C640,760 680,660 700,640');
    grove(300, 1050, 5, 3, 150); grove(880, 700, 4, 5, 120); grove(520, 1150, 3, 8, 100); grove(430, 560, 3, 11, 90);
    house(520, 700, 160, 120, '--roof-fedify', 'fedify-honden', { plateTxt: L.honden });
    house(330, 860, 120, 95, '--roof-fedify', 'sig', { plateTxt: L.sig });
    house(770, 860, 120, 95, '--roof-fedify', 'vocab', { plateTxt: L.vocab });
    house(650, 560, 100, 80, '--roof-fedify', 'kobo', { plateTxt: L.kobo });
    { const names = ['postgres', 'redis', 'sqlite', 'mysql', 'denokv', 'amqp'];
      const g = E('g', { 'data-id': 'kura' }, gBuild);
      names.forEach((n, i) => {
        const x = 300 + (i % 3) * 88, y = 560 + Math.floor(i / 3) * 78;
        shadow(x + 30, y + 52, 36);
        E('rect', { x, y: y + 14, width: 60, height: 38, class: 'f-wall sw', rx: 2 }, g);
        E('path', { d: `M${x - 4},${y + 16} L${x + 30},${y} L${x + 64},${y + 16} Z`,
          fill: 'var(--roof-fedify)', stroke: 'var(--ink)', 'stroke-width': 1.3, class: 'sw' }, g);
        txt(x + 30, y + 40, n, 'mono lbl-soft sm sw', 9.5, g);
      });
      txt(430, 700, L.kura, 'lbl sm sw', 14, gLbl); }
    house(455, 1055, 64, 52, '--roof-fedify', 'guide', { plateTxt: L.annai });
    { const g = E('g', { 'data-id': 'webfinger' }, gBuild), x = 620, y = 1130;
      shadow(x, y + 62, 44);
      E('rect', { x: x - 34, y, width: 9, height: 62, fill: '#8A7B5C', stroke: 'var(--ink)', 'stroke-width': 1.2, class: 'sw' }, g);
      E('rect', { x: x + 25, y, width: 9, height: 62, fill: '#8A7B5C', stroke: 'var(--ink)', 'stroke-width': 1.2, class: 'sw' }, g);
      E('path', { d: `M${x - 46},${y + 4} Q${x},${y - 14} ${x + 46},${y + 4} l0,10 Q${x},${y - 4} ${x - 46},${y + 14} Z`,
        fill: '#8A7B5C', stroke: 'var(--ink)', 'stroke-width': 1.2, class: 'sw' }, g);
      txt(x, y + 92, L.webfinger, 'lbl sm sw', 13, gLbl); }
    { const g = E('g', { 'data-id': 'nodeinfo' }, gBuild), x = 810, y = 1040;
      shadow(x, y + 54, 30);
      E('rect', { x: x - 3, y: y + 14, width: 6, height: 40, fill: '#8A7B5C', class: 'sw' }, g);
      E('rect', { x: x - 26, y: y - 14, width: 52, height: 32, class: 'f-wall sw' }, g);
      E('path', { d: `M${x - 32},${y - 14} L${x},${y - 28} L${x + 32},${y - 14} Z`,
        fill: 'var(--roof-fedify)', stroke: 'var(--ink)', 'stroke-width': 1.2, class: 'sw' }, g);
      txt(x, y + 74, L.nodeinfo, 'lbl sm sw', 12, gLbl); }
    { const g = E('g', { 'data-id': 'bridges' }, gBuild);
      const names = ['hono', 'express', 'fastify', 'koa', 'h3', 'elysia', 'nestjs', 'next',
        'nuxt', 'sveltekit', 'fresh', 'astro', 'solidstart', 'cfworkers'];
      names.forEach((n, i) => {
        const y = 520 + i * 40, x = 1120 + Math.sin((i / 13) * Math.PI) * 70;
        E('path', { d: `M${x - 100},${y} Q${x - 50},${y - 14} ${x - 16},${y}`,
          stroke: 'var(--ink)', fill: 'none', 'stroke-width': 2.5, class: 'sw' }, g);
        E('circle', { cx: x, cy: y, r: 10, class: 'f-land sw' }, g);
        txt(x + 16, y + 4, n, 'mono lbl-soft sm sw', 10.5, g, 'start');
      });
      txt(1150, 486, L.bridges, 'lbl sw', 15, gLbl); }
    { const g = E('g', { 'data-id': 'relay' }, gBuild), x = 1062, y = 290;
      shadow(x, y + 72, 26);
      E('path', { d: `M${x - 13},${y + 72} L${x - 8},${y + 8} L${x + 8},${y + 8} L${x + 13},${y + 72} Z`, class: 'f-wall sw' }, g);
      E('rect', { x: x - 9, y: y - 6, width: 18, height: 14, fill: 'var(--shu)', stroke: 'var(--ink)', 'stroke-width': 1.3, class: 'sw' }, g);
      E('circle', { cx: x, cy: y + 1, r: 4, fill: 'var(--gold)', class: 'sw' }, g);
      E('path', { d: `M${x - 16},${y - 6} L${x},${y - 16} L${x + 16},${y - 6} Z`,
        fill: 'var(--roof-fedify)', stroke: 'var(--ink)', 'stroke-width': 1.3, class: 'sw' }, g);
      txt(x, y + 100, L.relay, 'lbl sm sw', 12, gLbl); }
    txt(600, 470, L.fedifyIsle, 'name sw', 34, gLbl);
    txt(600, 502, L.fedifySub, 'mono lbl-soft sw', 13, gLbl);

    // hollo 島
    hall(1570, 1040, 240, 150, '--roof-hollo', L.holloHall, [
      { id: 'hollo-pages', label: L.parlor, code: 'src/pages' },
      { id: 'hollo-api', label: L.reception, code: 'src/api' },
      { id: 'hollo-fed', label: L.diplomacy, code: 'src/federation' },
    ]);
    house(1620, 1230, 80, 64, '--roof-hollo', 'hollo-oauth', { plateTxt: L.keys });
    pagoda(1890, 1075, 75, 'hollo-bunsha');
    txt(1890, 1190, L.bunsha, 'lbl sm sw', 13, gLbl);
    txt(1890, 1208, L.npmEd, 'mono lbl-soft sm sw', 10.5, gLbl);
    grove(1560, 1260, 3, 17, 90);
    road('M1690,1200 C1750,1230 1820,1230 1880,1180');
    E('path', { d: 'M1960,1220 l90,26', stroke: '#8A7B5C', 'stroke-width': 8, class: 'sw' }, gDeco);

    // hackers.pub 島
    hall(1620, 330, 300, 170, '--roof-hp', L.hpHall, [
      { id: 'hp-web', label: L.reading, code: 'web/' },
      { id: 'hp-graphql', label: L.inquiry, code: 'graphql/' },
      { id: 'hp-models', label: L.stacks, code: 'models/' },
      { id: 'hp-fed', label: L.diplomacy, code: 'federation/' },
    ]);
    house(1600, 540, 86, 66, '--roof-hp', 'hp-ai', { plateTxt: L.newWing });
    pagoda(1985, 385, 75, 'hp-bunsha');
    txt(1985, 500, L.bunsha, 'lbl sm sw', 13, gLbl);
    txt(1985, 518, L.jsrEd, 'mono lbl-soft sm sw', 10.5, gLbl);
    grove(1650, 600, 3, 23, 90);
    road('M1770,520 C1850,540 1930,510 1975,470');

    // 外交の海
    { const routes = [
        'M2050,1250 C2180,1220 2280,1140 2380,1100',
        'M1120,300 C1350,220 1900,180 2380,220',
        'M2060,480 C2180,560 2300,560 2380,540'];
      routes.forEach((d, i) => {
        E('path', { d, stroke: 'var(--sea-deep)', 'stroke-width': 2, 'stroke-dasharray': '3 9', fill: 'none', class: 'sw' }, gShips);
        const g = E('g', { 'data-id': 'sea-route' }, gShips);
        ship(g);
        if (reduced) g.setAttribute('transform', 'translate(' + (2100 + i * 60) + ',' + (1230 - i * 380) + ')');
        else E('animateMotion', { dur: 46 + i * 14 + 's', repeatCount: 'indefinite', path: d }, g);
      });
      txt(2265, 1064, L.toMastodon, 'lbl-soft sw', 15, gLbl);
      txt(2250, 186, L.toMisskey, 'lbl-soft sw', 15, gLbl);
      txt(2258, 600, L.toPixelfed, 'lbl-soft sw', 15, gLbl);
      txt(1520, 760, L.seaName, 'name sw', 30, gLbl).setAttribute('opacity', '.6');
      txt(1520, 792, L.seaSub, 'lbl-soft sw', 13, gLbl).setAttribute('opacity', '.75'); }

    // 道しるべ
    signpost(850, 1190, L.signHollo, 'hollo-isle');
    signpost(800, 520, L.signHpNE, 'hp-isle');
    signpost(1495, 1305, L.signFedifyW, 'fedify-isle');
    signpost(1935, 975, L.signHpN, 'hp-isle');
    signpost(1540, 615, L.signFedifySW, 'fedify-isle');
    signpost(1855, 640, L.signHolloS, 'hollo-isle');

    // 数学の隠れ街(レンズの下)
    { const g = gMath;
      E('ellipse', { cx: 1300, cy: 800, rx: 300, ry: 230, fill: 'rgba(232,193,104,.05)',
        stroke: 'var(--gold)', 'stroke-width': 1, 'stroke-dasharray': '2 8' }, g);
      const mhouse = (x, y, w, h, id, label) => {
        const m = E('g', { 'data-id': id }, g);
        E('rect', { x, y, width: w, height: h, class: 'm-glow', rx: 3 }, m);
        txt(x + w / 2, y + h + 20, label, 'm-text lbl sm', 13, m);
        return m;
      };
      { const m = mhouse(1120, 690, 90, 62, 'math-ec', L.mathEc);
        E('path', { d: 'M1136,738 C1150,690 1180,752 1196,706', class: 'm-line' }, m); }
      { const m = E('g', { 'data-id': 'math-prime' }, g);
        E('circle', { cx: 1268, cy: 930, r: 26, class: 'm-glow' }, m);
        E('circle', { cx: 1268, cy: 930, r: 13, fill: '#161C2E', stroke: 'var(--gold)', 'stroke-width': 1.4 }, m);
        txt(1268, 986, L.mathPrime, 'm-text lbl sm', 13, m); }
      { const m = mhouse(1400, 660, 54, 84, 'math-hash', L.mathHash);
        E('path', { d: 'M1408,702 h30 m-10,-9 l10,9 l-10,9', class: 'm-line' }, m); }
      { const m = mhouse(1400, 850, 96, 66, 'math-graph', L.mathGraph);
        const pts = [[1420, 900], [1448, 868], [1476, 898], [1448, 908]];
        E('path', { d: 'M1420,900 L1448,868 L1476,898 L1448,908 Z M1448,868 L1448,908',
          class: 'm-line', 'stroke-width': 1.4 }, m);
        pts.forEach((p) => E('circle', { cx: p[0], cy: p[1], r: 3.5, fill: 'var(--gold)' }, m)); }
      { const m = E('g', { 'data-id': 'math-logic' }, g);
        E('path', { d: 'M1180,560 L1225,532 L1270,560 Z', class: 'm-glow' }, m);
        for (let i = 0; i < 3; i++) E('rect', { x: 1192 + i * 24, y: 564, width: 9, height: 44, class: 'm-glow' }, m);
        E('rect', { x: 1184, y: 608, width: 82, height: 8, class: 'm-glow' }, m);
        txt(1225, 644, L.mathLogic, 'm-text lbl sm', 13, m); }
      txt(1300, 1052, L.mathTown, 'name m-text', 26, g);
      txt(1300, 1080, L.mathSub, 'm-text lbl-soft sm', 12.5, g).setAttribute('opacity', '.8');

      const threads = [
        'M395,905 C700,1050 980,900 1165,740',
        'M395,905 C660,1090 1050,1030 1250,945',
        'M400,900 C760,1150 1180,900 1420,730',
        'M835,905 C1050,1000 1280,950 1440,890',
        'M840,895 C1000,820 1120,680 1218,590',
        'M1888,1120 C1700,1050 1520,950 1360,880',
        'M1983,430 C1800,520 1560,620 1380,700',
      ];
      threads.forEach((d, i) => {
        const p = E('path', { d, class: 'thread' }, gThreads);
        if (!reduced) {
          const b = E('circle', { r: 3.5, class: 'bead' }, gThreads);
          BEADS.push({ el: b, path: p, len: p.getTotalLength(), dur: 5.5 + i * 0.7, off: i * 0.9 });
        }
      });
    }

    // めぐりの印
    gMark = E('g', { class: 'surface' });
    for (const id in DATA) {
      if (id === 'welcome') continue;
      if (id === 'sea-route') { addMarker(id, 1610, 740, gMark); continue; } // 船は動くので海に一つ
      const el = svgEl.querySelector(`[data-id="${id}"]`);
      if (!el) continue;
      const b = el.getBBox();
      addMarker(id, b.x + b.width, b.y, id.startsWith('math-') ? gMath : gMark);
    }
  }

  /* ---------- カメラ ---------- */
  let lastFar = null, lastNear = null, lastMk = null, mkFrozen = false;
  const mkFor = (w) => Math.min(2.1, Math.max(0.75, w / 950));
  function setMk(v) {
    const mk = v.toFixed(2);
    if (mk !== lastMk) { svgEl.style.setProperty('--mk-scale', mk); lastMk = mk; }
  }
  function render() {
    cam.w = Math.min(3000, Math.max(220, cam.w));
    const h = (cam.w * H) / W;
    cam.x = Math.min(W - cam.w * 0.25, Math.max(-cam.w * 0.75, cam.x));
    cam.y = Math.min(H - h * 0.25, Math.max(-h * 0.75, cam.y));
    svgEl.setAttribute('viewBox', `${cam.x} ${cam.y} ${cam.w} ${h}`);
    // スタイルの書き込みは、値が変わる瞬間だけ(毎フレームやると滑空がかくつく)
    const far = cam.w > 1500, near = cam.w < 1320;
    if (far !== lastFar) { svgEl.classList.toggle('far', far); lastFar = far; }
    if (near !== lastNear) { svgEl.classList.toggle('near', near); lastNear = near; }
    // 印の逆スケールは、滑空中は凍結(行き先サイズに合わせ済み)。手動ズームは粗い刻みで
    if (!mkFrozen) setMk(Math.round(mkFor(cam.w) / 0.15) * 0.15);
  }
  function clientToWorld(cx, cy) {
    const p = new DOMPoint(cx, cy).matrixTransform(svgEl.getScreenCTM().inverse());
    return [p.x, p.y];
  }
  function glideTo(fx, fy, fw) {
    if (animId) cancelAnimationFrame(animId);
    if (reduced) { cam = { x: fx, y: fy, w: fw }; render(); return; }
    // 滑空中は選択の灯(drop-shadow)を休ませる——毎フレームのフィルタ再計算が重い
    svgEl.classList.add('gliding');
    // 印の大きさは、飛び立つ瞬間に着地サイズへ一度だけ
    setMk(mkFor(fw));
    mkFrozen = true;
    const from = { ...cam }, t0 = performance.now(), dur = 1150;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    (function step(now) {
      const t = Math.min(1, (now - t0) / dur), e = ease(t);
      cam = { x: from.x + (fx - from.x) * e, y: from.y + (fy - from.y) * e, w: from.w + (fw - from.w) * e };
      render();
      if (t < 1) animId = requestAnimationFrame(step);
      else { animId = null; mkFrozen = false; svgEl.classList.remove('gliding'); }
    })(t0);
  }

  /* ---------- 選択 ---------- */
  function select(id) {
    selEls.forEach((e) => e.classList.remove('sel'));
    selEls = [];
    if (!id) return;
    svgEl.querySelectorAll(`[data-id="${id}"]`).forEach((e) => { e.classList.add('sel'); selEls.push(e); });
  }
  function open(id, { hash = true } = {}) {
    if (!DATA[id]) return;
    firstStamp = id !== 'welcome' && !visited.ids.includes(id);
    if (id !== 'welcome') markVisited(id);
    sel = id;
    select(id === 'welcome' ? null : id);
    if (hash) try { replaceState(id === 'welcome' ? location.pathname : '#' + id, {}); } catch { /* boot前は見送る */ }
    const f = focusOf(id);
    if (f) glideTo(...f);
  }
  function closePanel() {
    sel = null;
    select(null);
    try { replaceState(location.pathname, {}); } catch { /* 同上 */ }
  }

  /* ---------- レンズ ---------- */
  function beadStep(now) {
    const s = now / 1000;
    for (const b of BEADS) {
      const u = ((s + b.off) % b.dur) / b.dur;
      const p = b.path.getPointAtLength(u * b.len);
      b.el.setAttribute('cx', p.x);
      b.el.setAttribute('cy', p.y);
    }
    beadRAF = requestAnimationFrame(beadStep);
  }
  function toggleLens() {
    ui.lens = !ui.lens;
    if (ui.lens && !visited.ids.includes('math-ec')) glideTo(...ISLE.math);
  }
  $effect(() => {
    if (!svgEl) return;
    if (ui.lens) {
      // 夜のあいだ、表の街の時計(船のSMIL)を止めて描画を静かにする
      if (svgEl.pauseAnimations) svgEl.pauseAnimations();
      if (BEADS.length && beadRAF === null) beadRAF = requestAnimationFrame(beadStep);
    } else {
      if (svgEl.unpauseAnimations) svgEl.unpauseAnimations();
      if (beadRAF !== null) { cancelAnimationFrame(beadRAF); beadRAF = null; }
    }
  });

  // めぐりの印を帳面と同期(白紙にもどしたときは消す)
  $effect(() => {
    const has = new Set(visited.ids);
    for (const [id, m] of Object.entries(markers)) m.classList.toggle('done', has.has(id));
  });

  // 白紙にもどすのは二段式(押し間違いで旅の記録が消えないように)
  let wipeArmed = $state(false);
  let wipeTimer = null;
  function wipe() {
    if (!wipeArmed) {
      wipeArmed = true;
      clearTimeout(wipeTimer);
      wipeTimer = setTimeout(() => (wipeArmed = false), 3000);
      return;
    }
    clearTimeout(wipeTimer);
    wipeArmed = false;
    resetVisited();
    // いま開いている場所には立っているので、そこだけ捺し直す
    if (sel && sel !== 'welcome') { markVisited(sel); firstStamp = true; }
  }

  /* ---------- 入力 ---------- */
  function attachPointers() {
    const ptrs = new Map();
    let moved = 0, downHit = null;
    svgEl.addEventListener('pointerdown', (e) => {
      svgEl.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 1) {
        moved = 0;
        // capture中のpointerupはsvgに付け替えられるので、押した瞬間の相手を覚えておく
        downHit = e.target.closest ? e.target.closest('[data-id],[data-goto]') : null;
      }
      if (animId) { cancelAnimationFrame(animId); animId = null; mkFrozen = false; svgEl.classList.remove('gliding'); }
      svgEl.classList.add('dragging');
    });
    svgEl.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return;
      const prev = ptrs.get(e.pointerId);
      if (ptrs.size === 1) {
        const [wx1, wy1] = clientToWorld(prev[0], prev[1]);
        const [wx2, wy2] = clientToWorld(e.clientX, e.clientY);
        cam.x += wx1 - wx2; cam.y += wy1 - wy2;
        moved += Math.hypot(e.clientX - prev[0], e.clientY - prev[1]);
        render();
      } else if (ptrs.size === 2) {
        const ids = [...ptrs.keys()], a = ptrs.get(ids[0]), b = ptrs.get(ids[1]);
        const na = e.pointerId === ids[0] ? [e.clientX, e.clientY] : a;
        const nb = e.pointerId === ids[1] ? [e.clientX, e.clientY] : b;
        const d0 = Math.hypot(a[0] - b[0], a[1] - b[1]), d1 = Math.hypot(na[0] - nb[0], na[1] - nb[1]);
        if (d1 > 0) {
          const mid = [(na[0] + nb[0]) / 2, (na[1] + nb[1]) / 2];
          const [mwx, mwy] = clientToWorld(mid[0], mid[1]);
          const k = d0 / d1;
          cam.w *= k; cam.x = mwx - (mwx - cam.x) * k; cam.y = mwy - (mwy - cam.y) * k;
          moved += 10; render();
        }
      }
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    });
    const up = (e) => {
      ptrs.delete(e.pointerId);
      svgEl.classList.remove('dragging');
      if (ptrs.size === 0 && moved < 8) {
        if (downHit) {
          const dest = downHit.getAttribute('data-goto');
          if (dest && GOTO[dest]) { closePanel(); glideTo(...GOTO[dest]); }
          else open(downHit.getAttribute('data-id'));
        } else {
          closePanel(); // 余白をひと押し=フォーカスを外す
        }
      }
      if (ptrs.size === 0) downHit = null;
    };
    svgEl.addEventListener('pointerup', up);
    svgEl.addEventListener('pointercancel', up);
    svgEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const k = Math.exp(e.deltaY * 0.0011);
      const [wx, wy] = clientToWorld(e.clientX, e.clientY);
      cam.w *= k; cam.x = wx - (wx - cam.x) * k; cam.y = wy - (wy - cam.y) * k;
      render();
    }, { passive: false });
  }

  function onKey(e) { if (e.key === 'Escape') closePanel(); }

  onMount(() => {
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    buildScene();
    attachPointers();
    render();
    const h = location.hash.slice(1);
    if (DATA[h] && h !== 'welcome') {
      if (h.startsWith('math-')) ui.lens = true;
      open(h, { hash: false });
    } else {
      open('welcome', { hash: false });
    }
  });

  onDestroy(() => {
    if (animId) cancelAnimationFrame(animId);
    if (beadRAF !== null) cancelAnimationFrame(beadRAF);
    ui.lens = false;
  });
</script>

<svelte:window onkeydown={onKey} />

<svelte:head><title>{T.map.plaqueTitle} — {T.site.title}</title></svelte:head>

<div class="map-root" class:lens={ui.lens}>
  <svg id="map" bind:this={svgEl} preserveAspectRatio="xMidYMid meet"
    aria-label={T.map.plaqueSub}></svg>

  <header class="plaque">
    <h1>{T.map.plaqueTitle}</h1>
    <p>{T.map.plaqueSub}</p>
    <div class="langline"><LangSwitch {lang} /></div>
    {#if !visited.ids.includes('guide')}
      <a class="guide-callout" href="{SEC}/rooms/guide/">{T.map.guideCallout}</a>
    {/if}
  </header>

  <div class="ctrl">
    <button onclick={toggleLens}>
      {#if ui.lens}{@html T.map.lensOff}{:else}{@html T.map.lensOn}{/if}
    </button>
    <button onclick={() => { closePanel(); glideTo(0, 0, W); }}>{T.map.fullView}</button>
  </div>

  <div class="stamp">{T.map.stamps} <b>{stamps}</b> / {TOTAL}
    {#if stamps > 0}
      <button class="wipe" onclick={wipe}>{wipeArmed ? T.map.wipeConfirm : T.map.wipe}</button>
    {/if}
  </div>

  <aside class="panel" class:open={sel !== null} aria-live="polite">
    {#if selData}
      <button class="pclose" onclick={closePanel} aria-label={T.map.close}>✕</button>
      <div class="kind">{selData.kind}</div>
      <h2>{selData.name}</h2>
      <p>{selData.body}</p>
      <div class="plinks">
        {#if sel !== 'welcome' && available.includes(sel)}
          <a class="roomlink" href="{SEC}/rooms/{sel}/">{sel === 'guide' ? T.map.enterGuide : T.map.enterRoom}</a>
        {/if}
        {#each selData.links as [label, href]}
          {#if href.startsWith('/')}
            <a href="/{lang}{href}" class={href.includes('/rooms/guide/') ? 'roomlink' : ''}>{label}</a>
          {:else}
            <a class="ext" {href} target="_blank" rel="noopener">{label}</a>
          {/if}
        {/each}
      </div>
      {#if sel !== 'welcome'}
        <div class="visitedline">{firstStamp ? T.map.stamped : T.map.stampedAlready}</div>
      {/if}
    {/if}
  </aside>
</div>

<style>
  .langline{margin-top:6px}
</style>
