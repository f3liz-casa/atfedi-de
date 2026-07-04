<script>
  import { onDestroy } from 'svelte';
  // 素数の井戸: 掛けるのは一瞬、割り戻す(登る)のは総当たり
  const PRIMES = {
    8: ['94999951', '94999907'], 9: ['949999993', '949999961'],
    10: ['9499999979', '9499999969'], 11: ['94999999993', '94999999987'],
    12: ['949999999961', '949999999931'], 13: ['9499999999991', '9499999999969'],
    14: ['94999999999997', '94999999999937'], 15: ['949999999999987', '949999999999969'],
  };
  let digits = $state(8);
  let p = $state(PRIMES[8][0]);
  let q = $state(PRIMES[8][1]);
  let out = $state('');
  let tick = $state('');
  let est = $state('');
  let climbing = $state(false);
  let stopped = false;

  const fmt = (x) => x.toLocaleString('ja-JP');
  function fmtDur(s) {
    if (s < 1) return '1秒未満';
    if (s < 60) return Math.round(s) + ' 秒';
    if (s < 3600) return Math.round(s / 60) + ' 分';
    if (s < 86400) return Math.round(s / 3600) + ' 時間';
    if (s < 31557600) return Math.round(s / 86400) + ' 日';
    const y = s / 31557600;
    if (y < 10000) return fmt(Math.round(y)) + ' 年';
    if (y < 1e8) return fmt(Math.round(y / 1e4)) + ' 万年';
    return (y / 1e8).toPrecision(2) + ' 億年';
  }
  function setDigits(dg) {
    digits = dg; stopped = true;
    [p, q] = PRIMES[dg];
    out = tick = est = '';
  }
  const nBig = () => BigInt(p) * BigInt(q);

  function multiply() {
    const t0 = performance.now();
    const n = nBig();
    out = `積 = ${fmt(n)}(${String(n).length}桁)\n(${(performance.now() - t0).toFixed(3)} ミリ秒で落ちました)`;
    tick = est = '';
  }

  function climb() {
    if (climbing) return;
    climbing = true; stopped = false;
    const n = nBig(), t0 = performance.now();
    let tried = 1;
    const lim = Math.sqrt(Number(n));
    const small = n <= 9007199254740991n;
    const nn = small ? Number(n) : null;
    let dN = 3, dB = 3n;
    out = '3, 5, 7, … と順に試します' + (small ? '' : '(この井戸は深い——BigIntの綱で登ります)');
    const finish = (msg) => { climbing = false; if (msg) out = msg; };
    const report = (dcur) => {
      const sec = (performance.now() - t0) / 1000, rate = tried / Math.max(sec, 0.001);
      out = `登っています… ${fmt(tried)} 回目(${fmt(Math.round(rate))} 回/秒)`;
      tick = `いま試している数: …${fmt(dcur)} ✗ …`;
      est = `登りきる保証ライン(√n)まで、この速さだと あと ${fmtDur((lim - Number(dcur)) / 2 / rate)}`;
    };
    const found = (d, other) => {
      finish(`見つけました: ${fmt(d)} × ${fmt(other)}\n${fmt(tried)} 回ためして、${((performance.now() - t0) / 1000).toFixed(2)} 秒かけて登りました`);
      tick = '(落ちるのは一瞬、登るのはこれだけ。桁がふえるたび、登りは百倍ずつ育ちます)';
      est = '';
    };
    function chunk() {
      if (stopped) {
        const sec = (performance.now() - t0) / 1000, rate = tried / Math.max(sec, 0.001);
        finish(`あきらめました。${fmt(tried)} 回(${fmtDur(sec)}ぶん)登ったところで引き返しました。`);
        est = `そのまま登りつづけていたら、保証ラインまで あと ${fmtDur((lim - (small ? dN : Number(dB))) / 2 / rate)} でした。`;
        return;
      }
      if (small) {
        const end = Math.min(dN + 1000000, lim + 1);
        for (; dN <= end; dN += 2) { tried++; if (nn % dN === 0) { found(dN, nn / dN); return; } }
        if (dN > lim) { finish('割れませんでした(素数?)'); return; }
        report(dN);
      } else {
        for (let i = 0; i < 150000; i++) {
          tried++;
          if (n % dB === 0n) { found(dB, n / dB); return; }
          dB += 2n;
        }
        if (Number(dB) > lim) { finish('割れませんでした(素数?)'); return; }
        report(dB);
      }
      setTimeout(chunk, 0);
    }
    chunk();
  }

  onDestroy(() => { stopped = true; });
</script>

<div class="row">
  <button onclick={() => digits > 8 && setDigits(digits - 1)} disabled={digits <= 8}>− 桁をへらす</button>
  <span class="mono" style="text-align:center">{digits}桁 × {digits}桁</span>
  <button onclick={() => digits < 15 && setDigits(digits + 1)} disabled={digits >= 15}>+ 桁をふやす</button>
</div>
<div class="row"><input type="text" bind:value={p} /><input type="text" bind:value={q} /></div>
<div class="row">
  <button onclick={multiply}>掛ける(井戸を落ちる)</button>
  <button onclick={climb}>積から割り戻す(登る)</button>
  {#if climbing}<button onclick={() => (stopped = true)}>あきらめる</button>{/if}
</div>
{#if out}<div class="mono" style="white-space:pre-wrap">{out}</div>{/if}
{#if tick}<div class="mono hint">{tick}</div>{/if}
{#if est}<div class="mono hint">{est}</div>{/if}
<div class="hint">登りは総当たりです。桁をふやすと、掛けるのは一瞬のまま、登りだけが育ちます。実物のRSAは300桁以上あります。</div>
