<script>
  import { onMount, getContext } from 'svelte';
  import { t } from '$lib/i18n.js';
  const T = t(getContext('museum:lang')()).toys.queue;

  let queue = $state([]);
  let delivered = $state(0);
  let away = $state(false);
  let log = $state(T.empty);
  let n = 0;

  function add() {
    queue.push({ id: ++n, tries: 0 });
    log = T.queued;
  }

  onMount(() => {
    const timer = setInterval(() => {
      if (!queue.length) return;
      const m = queue.shift();
      if (away) {
        m.tries++;
        queue.push(m);
        log = T.failed(m.id);
      } else {
        delivered++;
        log = T.delivered(m.id);
      }
    }, 900);
    return () => clearInterval(timer);
  });
</script>

<div class="row">
  <button onclick={add}>{T.add}</button>
  <label><input type="checkbox" bind:checked={away} /> {T.away}</label>
</div>
<div class="qrow">
  {#each queue as m (m.id)}
    <span class="env" class:retry={m.tries > 0}>{T.env(m.id)}{m.tries > 0 ? T.retry(m.tries) : ''}</span>
  {/each}
</div>
<div class="hint">{log}</div>
<div class="mono">{T.count(delivered)}</div>
