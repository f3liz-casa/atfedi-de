<script>
  // 署名して、改ざんして、検めるおもちゃ(Web CryptoのEd25519)
  import { getContext } from 'svelte';
  import { t } from '$lib/i18n.js';
  const T = t(getContext('museum:lang')()).toys.ed25519;

  let msg = $state(T.sample);
  let tamper = $state(false);
  let keyLine = $state('');
  let sigLine = $state('');
  let result = $state(null);
  let pair = null;

  const hex = (buf) =>
    [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

  async function run() {
    try {
      pair ??= await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify']);
    } catch {
      result = { unsupported: true };
      return;
    }
    const enc = new TextEncoder();
    const sig = await crypto.subtle.sign('Ed25519', pair.privateKey, enc.encode(msg));
    keyLine = T.pub(hex(await crypto.subtle.exportKey('raw', pair.publicKey)));
    sigLine = T.sig(hex(sig).slice(0, 48));
    let delivered = msg;
    if (tamper && msg.length > 0) delivered = (msg[0] === 'a' ? 'b' : 'a') + msg.slice(1);
    const ok = await crypto.subtle.verify('Ed25519', pair.publicKey, sig, enc.encode(delivered));
    result = { ok, delivered };
  }
</script>

<textarea bind:value={msg}></textarea>
<div class="row">
  <button onclick={run}>{T.run}</button>
  <label><input type="checkbox" bind:checked={tamper} /> {T.tamper}</label>
</div>
{#if keyLine}<div class="mono">{keyLine}</div>{/if}
{#if sigLine}<div class="mono">{sigLine}</div>{/if}
{#if result?.unsupported}
  <div><span class="bad">{T.unsupported}</span></div>
{:else if result}
  <div>
    {#if result.ok}
      <span class="ok">{T.ok}</span>
    {:else}
      <span class="bad">{T.bad}</span>
      <span class="hint">{T.delivered(result.delivered.slice(0, 20))}</span>
    {/if}
  </div>
{/if}
