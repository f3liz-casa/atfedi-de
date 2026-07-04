<script>
  import { onMount } from 'svelte';
  import { GUIDE } from '$lib/guide-data.js';
  import { DATA } from '$lib/map/data.js';
  import { islandOf } from '$lib/museum.js';
  import { visited, markVisited } from '$lib/visited.svelte.js';

  const isle = (id) => islandOf(DATA[id].kind);
  const seen = (id) => visited.ids.includes(id);

  onMount(() => markVisited('guide'));
</script>

<svelte:head><title>はじめてのActivityPub — フェディの博物街</title></svelte:head>

<div class="sheet">
  <div class="backline"><a href="/section/fedify/#guide">← 地図にもどる</a></div>

  <header class="plaque">
    <div class="kind">ごあんない・案内所</div>
    <h1>はじめてのActivityPub</h1>
  </header>

  {#each GUIDE.intro as p}<p>{@html p}</p>{/each}

  <h2>一通の文が、海を渡るまで</h2>
  <ol class="journey">
    {#each GUIDE.steps as s}
      <li>
        <div class="j-head">
          <span class="j-title">{s.title}</span>
          <a class="j-room {seen(s.room) ? 'seen' : 'unseen'}" href="/section/fedify/rooms/{s.room}/">→ {DATA[s.room].name}</a>
          <span class="isle" style="color:{isle(s.room).color}">{isle(s.room).label}</span>
        </div>
        <p>{@html s.text}</p>
      </li>
    {/each}
  </ol>

  {#each GUIDE.outro as p}<p>{@html p}</p>{/each}

  <h2>ことばに迷ったら</h2>
  <div class="chips">
    <a href="/section/fedify/rooms/kotoba/">ことばの栞</a>
    <a href="/section/fedify/rooms/webfinger/" class={seen('webfinger') ? 'seen' : 'unseen'}>順路のはじまり: webfingerの門</a>
  </div>

  <nav class="route">
    <span></span>
    <a class="to-map" href="/section/fedify/">地図</a>
    <span></span>
  </nav>
</div>

<style>
  ol.journey{list-style:none; display:flex; flex-direction:column; gap:18px;
    counter-reset:j; margin-bottom:26px}
  ol.journey li{counter-increment:j; position:relative; padding-left:44px}
  ol.journey li::before{content:counter(j); position:absolute; left:0; top:0;
    width:28px; height:28px; border-radius:50%; border:1.5px solid var(--shu);
    color:var(--shu); display:flex; align-items:center; justify-content:center;
    font-family:ui-monospace,"SF Mono",Menlo,monospace; font-size:.85rem; background:var(--wall)}
  .j-head{display:flex; align-items:baseline; gap:12px; flex-wrap:wrap}
  .j-title{font-family:"Hiragino Mincho ProN","Yu Mincho",serif; font-weight:600;
    letter-spacing:.12em; font-size:1rem}
  .j-room{font-size:.78rem; color:var(--ink-soft); text-decoration:none;
    border-bottom:1px solid var(--shu)}
  :global(.j-room.seen)::before,:global(.j-room.unseen)::before{
    content:""; display:inline-block; width:8px; height:8px; border-radius:50%;
    border:1.5px solid var(--shu); background:var(--wall); margin-right:6px}
  :global(.j-room.seen)::before{background:var(--shu)}
  ol.journey li p{font-size:.87rem; margin:3px 0 0}
</style>
