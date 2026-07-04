<script>
  import { GLOSSARY } from '$lib/guide-data.js';
  import { DATA } from '$lib/map/data.js';
  import { visited } from '$lib/visited.svelte.js';

  const seen = (id) => visited.ids.includes(id);
</script>

<svelte:head><title>ことばの栞 — フェディの博物街</title></svelte:head>

<div class="sheet">
  <div class="backline"><a href="/section/fedify/">← 地図にもどる</a></div>

  <header class="plaque">
    <div class="kind">ごあんない</div>
    <h1>ことばの栞</h1>
  </header>

  <p>むずかしいことばに出会ったら、ここへ。それぞれの札から、くわしい部屋へ渡れます。</p>

  <div class="files">
    {#each GLOSSARY as g}
      <div class="file">
        <b>{g.term}</b>
        <div class="what">{g.desc}</div>
        <div class="g-room">
          <a href="/section/fedify/rooms/{g.room}/" class={seen(g.room) ? 'seen' : 'unseen'}>→ {DATA[g.room].name}</a>
        </div>
      </div>
    {/each}
  </div>

  <nav class="route">
    <span></span>
    <a class="to-map" href="/section/fedify/">地図</a>
    <span></span>
  </nav>
</div>

<style>
  .file b{font-size:.9rem}
  .g-room{margin-top:5px; font-size:.78rem}
  .g-room a{color:var(--ink-soft); text-decoration:none; border-bottom:1px solid var(--shu)}
  .g-room a::before{
    content:""; display:inline-block; width:8px; height:8px; border-radius:50%;
    border:1.5px solid var(--shu); background:var(--wall); margin-right:6px}
  :global(.g-room a.seen)::before{background:var(--shu)}
</style>
