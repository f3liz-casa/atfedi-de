<script>
  import { onMount } from 'svelte';
  // 楕円曲線の散歩: 「Gをたす」で一歩ずつ跳ぶ。なぞの公開鍵を歩いて探す
  const A = -2, B = 2;
  const f = (x) => x * x * x + A * x + B;
  const VW = 560, VH = 340;
  const xmin = -2.7, xmax = 3.7, ymin = -5.8, ymax = 5.8;
  const sx = (x) => ((x - xmin) / (xmax - xmin)) * VW;
  const sy = (y) => VH - ((y - ymin) / (ymax - ymin)) * VH;
  const G = { x: -1.7, y: Math.sqrt(f(-1.7)) };
  const INK = '#3B372E', SHU = '#C6472E', GOLD = '#B8860B', PAPER = '#F7F2E3';
  const SCALE =
    '実物の秘密の回数は 2^256 通り——数字で書くと78桁です。78桁がどれくらいかというと、' +
    '観測できる宇宙の原子をぜんぶ数えて、やっと80桁。宇宙の始まり(138億年前)から' +
    '毎秒10億回「Gをたす」を押し続けたとしても、まだ27桁回——78桁への道のりの、爪の先にも届きません。';
  const HINT =
    '「G をたす」を押すたび、いまの点とGを結ぶ直線が曲線と三つ目に出会い、x軸で折り返した先へ跳びます' +
    '——それが足し算一回。k回分の到達点「kG」が公開鍵です。足あと(2G、3G……)は曲線の上に残ります。' +
    'ときどき画面のそとまで跳びますが、それも曲線の上です。';

  let cv;
  let ctx;
  let status = $state('');
  let hint = $state(HINT);
  let P, k, trail, lastLine;
  let secretK = null, secretP = null, revealed = false, found = false;
  let hasSecret = $state(false);

  function add(P1, Q) {
    if (Math.abs(P1.x - Q.x) < 1e-12 && Math.abs(P1.y + Q.y) < 1e-12) return null;
    const m = Math.abs(P1.x - Q.x) < 1e-12
      ? (3 * P1.x * P1.x + A) / (2 * P1.y)
      : (Q.y - P1.y) / (Q.x - P1.x);
    const x = m * m - P1.x - Q.x, y = m * (x - P1.x) + P1.y;
    return { x, y: -y, m, c: P1.y - m * P1.x };
  }
  const visible = (p) => p.x > xmin + 0.1 && p.x < xmax - 0.1 && Math.abs(p.y) < ymax - 0.3;

  function branch(sign) {
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= VW; px++) {
      const x = xmin + ((xmax - xmin) * px) / VW, v = f(x);
      if (v < 0) { started = false; continue; }
      const y = sign * Math.sqrt(v);
      if (!started) { ctx.moveTo(px, sy(y)); started = true; } else ctx.lineTo(px, sy(y));
    }
    ctx.stroke();
  }
  function dot(x, y, r, fill, label) {
    ctx.beginPath(); ctx.arc(sx(x), sy(y), r, 0, 7);
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    if (label) { ctx.fillStyle = INK; ctx.font = '10px ui-monospace,monospace'; ctx.fillText(label, sx(x) + 7, sy(y) - 6); }
  }
  function draw() {
    ctx.clearRect(0, 0, VW, VH);
    ctx.strokeStyle = 'rgba(59,55,46,.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, sy(0)); ctx.lineTo(VW, sy(0)); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6; branch(1); branch(-1);
    if (lastLine) {
      ctx.strokeStyle = SHU; ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(sx(xmin), sy(lastLine.m * xmin + lastLine.c));
      ctx.lineTo(sx(xmax), sy(lastLine.m * xmax + lastLine.c));
      ctx.stroke();
      if (visible(P)) {
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(sx(P.x), sy(-P.y)); ctx.lineTo(sx(P.x), sy(P.y)); ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    for (const t of trail) {
      if (t.k === k || t.k === 1) continue; // 1GはGの札が兼ねる
      if (visible(t)) dot(t.x, t.y, 3, 'rgba(59,55,46,.25)', t.k + 'G');
    }
    if (k !== 1) dot(G.x, G.y, 5, PAPER, 'G');
    if (secretP && visible(secretP)) {
      ctx.beginPath(); ctx.arc(sx(secretP.x), sy(secretP.y), 9, 0, 7);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = GOLD; ctx.font = '11px ui-monospace,monospace';
      ctx.fillText(revealed || found ? secretK + 'G' : '?G', sx(secretP.x) + 11, sy(secretP.y) + 4);
    }
    if (visible(P)) dot(P.x, P.y, 5.5, SHU, k === 1 ? 'G(いまここ。ここから歩く)' : k + 'G(いまここ)');
    else {
      const cx = Math.max(xmin + 0.2, Math.min(xmax - 2.2, P.x));
      const cy = Math.max(ymin + 0.4, Math.min(ymax - 0.4, P.y));
      ctx.fillStyle = SHU; ctx.font = '11px ui-monospace,monospace';
      ctx.fillText(k + 'G は地平線のむこう →', sx(cx), sy(cy));
    }
  }
  function setStatus(extra) {
    let s = 'いま: ' + k + 'G' + (k === 1 ? '(Gから出発)' : '');
    if (!visible(P)) s += ' — 画面のそと(それでも曲線の上)';
    status = extra || s;
  }
  function reset() {
    P = { x: G.x, y: G.y }; k = 1;
    trail = [{ k: 1, x: P.x, y: P.y }];
    lastLine = null; found = false;
    draw(); setStatus('');
  }
  function step() {
    const R = add(P, G);
    if (!R) { setStatus('ゼロ(無限遠点)に着きました。はじめに戻ります。'); reset(); return; }
    lastLine = { m: R.m, c: R.c };
    P = { x: R.x, y: R.y }; k++;
    trail.push({ k, x: P.x, y: P.y });
    draw();
    if (secretK && k === secretK && !found) {
      found = true;
      setStatus(`なぞの点に、ぴったり重なりました。秘密の回数は ${k} 回——いまあなたがしたのが「総当たり」です。「なぞの公開鍵を出す」をもう一度押すと、別のだれかの鍵が出ますよ。`);
      hint = SCALE;
    } else setStatus('');
  }
  function mystery() {
    let Q = { x: G.x, y: G.y };
    const pts = [];
    for (let i = 2; i <= 16; i++) { const R = add(Q, G); Q = { x: R.x, y: R.y }; pts.push({ k: i, x: Q.x, y: Q.y }); }
    const prevK = secretK;
    const cand = pts.filter((p) => visible(p) && p.k >= 5 && p.k !== prevK);
    const pick = cand[Math.floor(Math.random() * cand.length)];
    secretK = pick.k; secretP = pick; revealed = false; found = false; hasSecret = true;
    reset();
    setStatus('金の輪が、だれかの公開鍵(秘密の回数だけGを足した到達点)。何回で着くか、歩いて確かめてみてください。');
  }
  function reveal() {
    if (!secretK) return;
    revealed = true; draw();
    setStatus(`秘密の回数は ${secretK} 回でした。座標(公開鍵)を見ても、回数は読めない——歩くしかない。それが離散対数問題です。別の鍵でもう一回、あそべます。`);
    hint = SCALE;
  }

  onMount(() => {
    ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = VW * dpr; cv.height = VH * dpr;
    cv.style.width = '100%'; cv.style.aspectRatio = `${VW} / ${VH}`;
    ctx.scale(dpr, dpr);
    reset();
  });
</script>

<canvas bind:this={cv}></canvas>
<div class="row">
  <button onclick={step}>G をたす</button>
  <button onclick={reset}>はじめから</button>
  <button onclick={mystery}>なぞの公開鍵を出す</button>
  {#if hasSecret}<button onclick={reveal}>答えを見る</button>{/if}
</div>
<div class="mono">{status}</div>
<div class="hint">{hint}</div>
