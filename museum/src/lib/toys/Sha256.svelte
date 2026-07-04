<script>
  // 一方通行の扉: 打つそばから影が出て、変わった桁だけ蛍光ペンで光る
  let value = $state('こんにちは');
  let chars = $state([]); // {ch, changed}
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
    if (last !== null) prevInfo = `ひとつ前の影: ${last.slice(0, 24)}… (64桁中 ${diff} 桁が変わりました)`;
    last = h;
  }

  $effect(() => { void value; render(); });
</script>

<input type="text" bind:value />
<div class="mono">影:
  {#each chars as c}{#if c.changed}<mark class="chg">{c.ch}</mark>{:else}{c.ch}{/if}{/each}
</div>
{#if prevInfo}<div class="mono hint">{prevInfo}</div>{/if}
<div class="hint">一文字だけ変えてみてください。影がどれだけ別物になるか。</div>
