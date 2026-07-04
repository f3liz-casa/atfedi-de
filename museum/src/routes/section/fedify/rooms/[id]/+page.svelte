<script>
  import { onMount } from 'svelte';
  import Render from '$lib/components/Render.svelte';
  import { islandOf, GH } from '$lib/museum.js';
  import { visited, markVisited } from '$lib/visited.svelte.js';

  let { data } = $props();
  const room = $derived(data.room);
  const here = $derived(islandOf(room.kind));

  // 別の島へのリンクなら、島名の添え書き
  const isle = (meta) => {
    const there = islandOf(meta.kind);
    return there.key === here.key ? null : there;
  };
  const seen = (id) => visited.ids.includes(id);

  onMount(() => markVisited(room.id));
</script>

<svelte:head><title>{room.name} — フェディの博物街</title></svelte:head>

<div class="sheet">
  <div class="backline"><a href="/section/fedify/#{room.id}">← 地図のこの場所にもどる</a></div>

  <header class="plaque">
    <div class="kind">{room.kind}</div>
    <h1>{room.name}</h1>
  </header>

  {#if room.plain}
    <div class="plain"><span class="plabel">はじめての人へ</span>{room.plain}</div>
  {/if}

  <Render node={room.body} />

  {#if room.files?.length}
    <h2>間取り</h2>
    <div class="files">
      {#each room.files as f}
        <div class="file">
          <a href="{GH[room.repo]}{f.path}" target="_blank" rel="noopener">{f.path}</a>
          <div class="what">{f.what}</div>
        </div>
      {/each}
    </div>
  {/if}

  {#if data.related.length}
    <h2>となりの部屋</h2>
    <div class="chips">
      {#each data.related as r}
        {@const there = isle(r)}
        <a href="/section/fedify/rooms/{r.id}/" class={seen(r.id) ? 'seen' : 'unseen'}
          style={there ? `border-color:${there.color}` : ''}>
          {r.name}{#if there}<span class="isle" style="color:{there.color}">{there.label}</span>{/if}
        </a>
      {/each}
    </div>
  {/if}

  {#if room.links?.length}
    <h2>そとへのリンク</h2>
    <div class="links">
      {#each room.links as l}
        <a href={l.href} target="_blank" rel="noopener">{l.label}</a>
      {/each}
    </div>
  {/if}

  <nav class="route">
    <span>
      {#if data.prev}
        <a href="/section/fedify/rooms/{data.prev.id}/" class={seen(data.prev.id) ? 'seen' : 'unseen'}>← {data.prev.name}</a>
        {#if isle(data.prev)}<span class="isle" style="color:{isle(data.prev).color}">{isle(data.prev).label}</span>{/if}
      {/if}
    </span>
    <span><a class="to-map" href="/section/fedify/#{room.id}">地図</a>
      ・ <a class="to-map" href="/section/fedify/rooms/kotoba/">ことば</a></span>
    <span>
      {#if data.next}
        <a href="/section/fedify/rooms/{data.next.id}/" class={seen(data.next.id) ? 'seen' : 'unseen'}>{data.next.name} →</a>
        {#if isle(data.next)}<span class="isle" style="color:{isle(data.next).color}">{isle(data.next).label}</span>{/if}
      {/if}
    </span>
  </nav>
</div>
