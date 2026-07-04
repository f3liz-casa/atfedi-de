<script>
  // 鍵の間: 合鍵の儀式(PKCE)。泥棒になってみることもできる
  import { getContext } from 'svelte';
  import { t } from '$lib/i18n.js';
  const T = t(getContext('museum:lang')()).toys.pkce;

  let verifier = $state(null);
  let challenge = $state(null);
  let stealing = $state(false);
  let guess = $state('');
  let result = $state('');
  let resultOk = $state(null);

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
    result = T.choose;
    resultOk = null;
  }
  async function real() {
    if (!challenge) return;
    stealing = false;
    const re = await sha(verifier);
    result = T.recompute(re.slice(0, 16));
    resultOk = re === challenge;
  }
  async function tryThief() {
    if (!challenge) return;
    const re = await sha(guess || T.empty);
    result = T.recompute(re.slice(0, 16));
    resultOk = re === challenge; // でっちあげは、まず一致しない
  }
</script>

<button onclick={begin}>{T.begin}</button>
{#if verifier}
  <div class="mono">{T.verifier(verifier.slice(0, 24))}</div>
  <div class="mono">{T.challenge(challenge.slice(0, 24))}</div>
  <div class="row">
    <button onclick={real}>{T.real}</button>
    <button onclick={() => { stealing = true; result = ''; resultOk = null; }}>{T.thief}</button>
  </div>
{/if}
{#if stealing}
  <div class="hint">{T.stealHint}</div>
  <div class="row">
    <input type="text" bind:value={guess} placeholder={T.guessPh} />
    <button onclick={tryThief}>{T.tryIt}</button>
  </div>
{/if}
{#if result}
  <div>
    {result}
    {#if resultOk}
      <span class="ok">{T.match}</span>
    {:else if resultOk === false}
      <span class="bad">{T.noMatch}</span>
      <span class="hint">{T.noMatchHint}</span>
    {/if}
  </div>
{/if}
<div class="hint">{T.hint}</div>
