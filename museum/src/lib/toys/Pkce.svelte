<script>
  // 鍵の間: 合鍵の儀式(PKCE)。泥棒になってみることもできる
  let verifier = $state(null);
  let challenge = $state(null);
  let stealing = $state(false);
  let guess = $state('');
  let result = $state('');
  let resultOk = $state(null); // true/false/null

  const b64url = (buf) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const sha = async (s) =>
    b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));

  async function begin() {
    const v = new Uint8Array(32);
    crypto.getRandomValues(v);
    verifier = b64url(v.buffer);
    challenge = await sha(verifier);
    stealing = false;
    result = 'さて、引換券を持って鍵の間へ。どちらで行きますか?';
    resultOk = null;
  }
  async function real() {
    if (!challenge) return;
    stealing = false;
    const re = await sha(verifier);
    result = `鍵の間が影を作り直しました: ${re.slice(0, 16)}…`;
    resultOk = re === challenge;
  }
  async function tryThief() {
    if (!challenge) return;
    const re = await sha(guess || '(てぶら)');
    result = `鍵の間が影を作り直しました: ${re.slice(0, 16)}…`;
    resultOk = re === challenge; // でっちあげは、まず一致しない
  }
</script>

<button onclick={begin}>合鍵の儀式(PKCE)を始める</button>
{#if verifier}
  <div class="mono">アプリの合言葉(手元にだけ): {verifier.slice(0, 24)}…</div>
  <div class="mono">鍵の間に渡した影:        {challenge.slice(0, 24)}…</div>
  <div class="row">
    <button onclick={real}>本物のアプリとして引き換える</button>
    <button onclick={() => { stealing = true; result = ''; resultOk = null; }}>泥棒になって横取りする</button>
  </div>
{/if}
{#if stealing}
  <div class="hint">泥棒のあなたが通信を覗いて盗めたのは、引換券と「影」だけ。合言葉そのものは、電線を流れていません。でっちあげて引き換えてみてください:</div>
  <div class="row">
    <input type="text" bind:value={guess} placeholder="でっちあげの合言葉" />
    <button onclick={tryThief}>引き換えに行く</button>
  </div>
{/if}
{#if result}
  <div>
    {result} →
    {#if resultOk}
      <span class="ok">一致——合鍵を渡します</span>
    {:else if resultOk === false}
      <span class="bad">不一致——門前払いです</span>
      <span class="hint">(引換券も影も盗めたのに、影から合言葉へは戻れない)</span>
    {/if}
  </div>
{/if}
<div class="hint">アプリは最初に「合言葉の影」だけを渡し、引き換えのとき本体を見せます。鍵の間は影を作り直して比べる——影から合言葉は逆算できません(一方通行の扉と同じ)。</div>
