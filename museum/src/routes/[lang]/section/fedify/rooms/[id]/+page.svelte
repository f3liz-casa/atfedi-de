<script>
  import Render from '$lib/components/Render.svelte';
  import LangSwitch from '$lib/components/LangSwitch.svelte';
  import { islandOf, GH } from '$lib/museum.js';
  import { t } from '$lib/i18n.js';
  import { visited, markVisited } from '$lib/visited.svelte.js';

  let { data } = $props();
  const room = $derived(data.room);
  const lang = $derived(data.lang);
  const T = $derived(t(data.lang));
  const SEC = $derived(`/${data.lang}/section/fedify`);
  const here = $derived(islandOf(room.kind));

  // 別の島へのリンクなら、島名の添え書き
  const isle = (meta) => {
    const there = islandOf(meta.kind);
    return there.key === here.key ? null : there;
  };
  const isleLabel = (there) => t(lang).islands[there.key];
  const seen = (id) => visited.ids.includes(id);

  // onMountだと部屋間の移動で走らない——部屋が変わるたび捺す
  $effect(() => { markVisited(room.id); });
</script>

<svelte:head><title>{room.name} — {T.site.fediTitle}</title></svelte:head>

<div class="sheet">
  <div class="backline">
    <a href="{SEC}/#{room.id}">{T.room.backToHere}</a>
  </div>

  <header class="plaque">
    <div class="kind">{room.kind}</div>
    <h1>{room.name}</h1>
    <div class="langline"><LangSwitch {lang} /></div>
  </header>

  {#if room.plain}
    <div class="plain"><span class="plabel">{T.room.ifNew}</span>{room.plain}</div>
  {/if}

  <Render node={room.body} />

  {#if room.files?.length}
    <h2>{T.room.floorPlan}</h2>
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
    <h2>{T.room.neighbors}</h2>
    <div class="chips">
      {#each data.related as r}
        {@const there = isle(r)}
        <a href="{SEC}/rooms/{r.id}/" class={seen(r.id) ? 'seen' : 'unseen'}
          style={there ? `border-color:${there.color}` : ''}>
          {r.name}{#if there}<span class="isle" style="color:{there.color}">{isleLabel(there)}</span>{/if}
        </a>
      {/each}
    </div>
  {/if}

  {#if room.links?.length}
    <h2>{T.room.outLinks}</h2>
    <div class="links">
      {#each room.links as l}
        <a href={l.href} target="_blank" rel="noopener">{l.label}</a>
      {/each}
    </div>
  {/if}

  <nav class="route">
    <span>
      {#if data.prev}
        <a href="{SEC}/rooms/{data.prev.id}/" class={seen(data.prev.id) ? 'seen' : 'unseen'}>← {data.prev.name}</a>
        {#if isle(data.prev)}<span class="isle" style="color:{isle(data.prev).color}">{isleLabel(isle(data.prev))}</span>{/if}
      {/if}
    </span>
    <span><a class="to-map" href="{SEC}/#{room.id}">{T.room.map}</a>
      ・ <a class="to-map" href="{SEC}/rooms/kotoba/">{T.room.words}</a></span>
    <span>
      {#if data.next}
        <a href="{SEC}/rooms/{data.next.id}/" class={seen(data.next.id) ? 'seen' : 'unseen'}>{data.next.name} →</a>
        {#if isle(data.next)}<span class="isle" style="color:{isle(data.next).color}">{isleLabel(isle(data.next))}</span>{/if}
      {/if}
    </span>
  </nav>
</div>

<style>
  .langline{margin-top:8px}
</style>
