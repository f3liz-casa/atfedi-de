<script>
  import { onMount } from 'svelte';
  // 倉の区画: 手紙を積んで、飛脚が運ぶ。留守なら倉に戻して再送
  let queue = $state([]);
  let delivered = $state(0);
  let away = $state(false);
  let log = $state('倉は空です。');
  let n = 0;

  function add() {
    queue.push({ id: ++n, tries: 0 });
    log = '倉に預けました。飛脚が順に運びます。';
  }

  onMount(() => {
    const t = setInterval(() => {
      if (!queue.length) return;
      const m = queue.shift();
      if (away) {
        m.tries++;
        queue.push(m);
        log = `文${m.id} は届きませんでした。倉に戻して、あとで再送します(実物は間隔をだんだん延ばします)。`;
      } else {
        delivered++;
        log = `文${m.id} が届きました。`;
      }
    }, 900);
    return () => clearInterval(t);
  });
</script>

<div class="row">
  <button onclick={add}>手紙を積む</button>
  <label><input type="checkbox" bind:checked={away} /> 相手の島が留守</label>
</div>
<div class="qrow">
  {#each queue as m (m.id)}
    <span class="env" class:retry={m.tries > 0}>文{m.id}{m.tries > 0 ? ` 再送${m.tries}` : ''}</span>
  {/each}
</div>
<div class="hint">{log}</div>
<div class="mono">届いた: {delivered}</div>
