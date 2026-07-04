<script>
  import { onDestroy, getContext } from 'svelte';
  import { t } from '$lib/i18n.js';
  const lang = getContext('museum:lang')();
  const T = t(lang).toys.prime;

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

  const fmt = (x) => x.toLocaleString(lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : 'en-US');
  function fmtDur(s) {
    const d = T.dur;
    if (s < 1) return d.under1;
    if (s < 60) return `${Math.round(s)} ${d.sec}`;
    if (s < 3600) return `${Math.round(s / 60)} ${d.min}`;
    if (s < 86400) return `${Math.round(s / 3600)} ${d.hour}`;
    if (s < 31557600) return `${Math.round(s / 86400)} ${d.day}`;
    const y = s / 31557600;
    if (y < 10000) return `${fmt(Math.round(y))} ${d.year}`;
    if (y < 1e8) return `${fmt(Math.round(y / 1e4))} ${d.manYear}`;
    return `${(y / 1e8).toPrecision(2)} ${d.okuYear}`;
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
    out = T.product(fmt(n), String(n).length, (performance.now() - t0).toFixed(3));
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
    out = T.start + (small ? '' : T.deep);
    const finish = (msg) => { climbing = false; if (msg) out = msg; };
    const report = (dcur) => {
      const sec = (performance.now() - t0) / 1000, rate = tried / Math.max(sec, 0.001);
      out = T.climbing(fmt(tried), fmt(Math.round(rate)));
      tick = T.trying(fmt(dcur));
      est = T.eta(fmtDur((lim - Number(dcur)) / 2 / rate));
    };
    const found = (a, b) => {
      finish(T.found(fmt(a), fmt(b), fmt(tried), ((performance.now() - t0) / 1000).toFixed(2)));
      tick = T.foundNote;
      est = '';
    };
    function chunk() {
      if (stopped) {
        const sec = (performance.now() - t0) / 1000, rate = tried / Math.max(sec, 0.001);
        finish(T.gaveUp(fmt(tried), fmtDur(sec)));
        est = T.gaveUpEta(fmtDur((lim - (small ? dN : Number(dB))) / 2 / rate));
        return;
      }
      if (small) {
        const end = Math.min(dN + 1000000, lim + 1);
        for (; dN <= end; dN += 2) { tried++; if (nn % dN === 0) { found(dN, nn / dN); return; } }
        if (dN > lim) { finish(T.noFactor); return; }
        report(dN);
      } else {
        for (let i = 0; i < 150000; i++) {
          tried++;
          if (n % dB === 0n) { found(dB, n / dB); return; }
          dB += 2n;
        }
        if (Number(dB) > lim) { finish(T.noFactor); return; }
        report(dB);
      }
      setTimeout(chunk, 0);
    }
    chunk();
  }

  onDestroy(() => { stopped = true; });
</script>

<div class="row">
  <button onclick={() => digits > 8 && setDigits(digits - 1)} disabled={digits <= 8}>{T.less}</button>
  <span class="mono" style="text-align:center">{T.digits(digits)}</span>
  <button onclick={() => digits < 15 && setDigits(digits + 1)} disabled={digits >= 15}>{T.more}</button>
</div>
<div class="row"><input type="text" bind:value={p} /><input type="text" bind:value={q} /></div>
<div class="row">
  <button onclick={multiply}>{T.multiply}</button>
  <button onclick={climb}>{T.climb}</button>
  {#if climbing}<button onclick={() => (stopped = true)}>{T.giveUp}</button>{/if}
</div>
{#if out}<div class="mono" style="white-space:pre-wrap">{out}</div>{/if}
{#if tick}<div class="mono hint">{tick}</div>{/if}
{#if est}<div class="mono hint">{est}</div>{/if}
<div class="hint">{T.hint}</div>
