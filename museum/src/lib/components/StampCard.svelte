<script>
  // 御朱印の順路カード: 26室の点が島の色で並び、捺した所は塗られ、
  // いまの部屋に輪。「つぎはこれ」が未訪問の次を指す
  import { islandOf } from '$lib/museum.js';
  import { t } from '$lib/i18n.js';
  import { visited } from '$lib/visited.svelte.js';

  let { route, current, lang } = $props();
  const T = $derived(t(lang));
  const SEC = $derived(`/${lang}/section/fedify`);

  const seen = (id) => visited.ids.includes(id);
  const count = $derived(route.filter((r) => visited.ids.includes(r.id)).length);
  const next = $derived.by(() => {
    const i = route.findIndex((r) => r.id === current);
    for (let s = 1; s <= route.length; s++) {
      const r = route[(i + s) % route.length];
      if (r.id !== current && !visited.ids.includes(r.id)) return r;
    }
    return null;
  });
</script>

<div class="stampcard">
  <div class="dots">
    {#each route as r (r.id)}
      <a href="{SEC}/rooms/{r.id}/" title={r.name} aria-label={r.name}
        class="dot" class:done={seen(r.id)} class:cur={r.id === current}
        style="--c:{islandOf(r.kind).color}"></a>
    {/each}
  </div>
  <div class="line">
    <span class="count">{T.stamp.progress(count, route.length)}</span>
    {#if next}
      <a class="nextlink" href="{SEC}/rooms/{next.id}/">{T.stamp.next}: {next.name} →</a>
    {:else}
      <span class="doneline">{T.stamp.done}</span>
    {/if}
  </div>
</div>

<style>
  .stampcard{background:var(--card); border:1px solid rgba(59,55,46,.4);
    border-radius:3px; padding:10px 14px; margin-bottom:26px;
    display:flex; flex-direction:column; gap:8px}
  .dots{display:flex; flex-wrap:wrap; gap:5px}
  .dot{width:11px; height:11px; border-radius:50%;
    border:1.5px solid var(--c); background:var(--wall); flex:none}
  .dot.done{background:var(--c)}
  .dot.cur{box-shadow:0 0 0 2px var(--shu)}
  .line{display:flex; gap:14px; flex-wrap:wrap; align-items:baseline; font-size:.78rem}
  .count{color:var(--shu); letter-spacing:.08em;
    font-family:ui-monospace,"SF Mono",Menlo,monospace}
  .nextlink{color:var(--ink); text-decoration:none; border-bottom:1px solid var(--shu);
    font-weight:600}
  .doneline{color:var(--ink-soft)}
</style>
