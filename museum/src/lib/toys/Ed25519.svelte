<script>
  // 署名して、改ざんして、検めるおもちゃ(Web CryptoのEd25519)
  let msg = $state('こんにちは、フェディバース。');
  let tamper = $state(false);
  let keyLine = $state('');
  let sigLine = $state('');
  let result = $state(null); // {ok, delivered} | {unsupported:true}
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
    keyLine = '公開鍵(32バイト): ' + hex(await crypto.subtle.exportKey('raw', pair.publicKey));
    sigLine = '署名(64バイト): ' + hex(sig).slice(0, 48) + '…';
    let delivered = msg;
    if (tamper && msg.length > 0) delivered = (msg[0] === 'あ' ? 'い' : 'あ') + msg.slice(1);
    const ok = await crypto.subtle.verify('Ed25519', pair.publicKey, sig, enc.encode(delivered));
    result = { ok, delivered };
  }
</script>

<textarea bind:value={msg}></textarea>
<div class="row">
  <button onclick={run}>署名して、検める</button>
  <label><input type="checkbox" bind:checked={tamper} /> 途中で一文字書き換える(改ざん)</label>
</div>
{#if keyLine}<div class="mono">{keyLine}</div>{/if}
{#if sigLine}<div class="mono">{sigLine}</div>{/if}
{#if result?.unsupported}
  <div><span class="bad">このブラウザは、まだEd25519の筆を持っていないようです。</span></div>
{:else if result}
  <div>
    {#if result.ok}
      <span class="ok">検印: 一致——本人の手紙です</span>
    {:else}
      <span class="bad">検印: 不一致——途中でだれかが触りました</span>
      <span class="hint">(届いた文: {result.delivered.slice(0, 20)}…)</span>
    {/if}
  </div>
{/if}
