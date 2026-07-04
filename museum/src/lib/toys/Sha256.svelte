<script>
  // 一方通行の扉: 打つそばから影が出て、変わった桁だけ蛍光ペンで光る
  import { getContext } from 'svelte';
  import { t } from '$lib/i18n.js';
  const T = t(getContext('museum:lang')()).toys.sha256;

  let value = $state(T.sample);
  let chars = $state([]);
  let prevInfo = $state('');
  let last = null;

  async function render() {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    const h = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (h === last) return; // IME確定のEnter等では光を消さない
    let diff = 0;
    chars = [...h].map((ch, i) => {
      const changed = last !== null && ch !== last[i];
      if (changed) diff++;
      return { ch, changed };
    });
    if (last !== null) prevInfo = T.prev(last.slice(0, 24), diff);
    last = h;
  }

  $effect(() => { void value; render(); });
</script>

<input type="text" bind:value />
<div class="mono">{T.shadow}{#each chars as c}{#if c.changed}<mark class="chg">{c.ch}</mark>{:else}{c.ch}{/if}{/each}</div>
{#if prevInfo}<div class="mono hint">{prevInfo}</div>{/if}
<div class="hint">{T.hint}</div>
