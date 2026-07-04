<script>
  import { onMount } from 'svelte';
  import LangSwitch from '$lib/components/LangSwitch.svelte';
  import { GUIDE as GJA } from '$lib/guide-data.ja.js';
  import { GUIDE as GEN } from '$lib/guide-data.en.js';
  import { GUIDE as GKO } from '$lib/guide-data.ko.js';
  import { CAPTIONS as CJA } from '$lib/map/captions.ja.js';
  import { CAPTIONS as CEN } from '$lib/map/captions.en.js';
  import { CAPTIONS as CKO } from '$lib/map/captions.ko.js';
  import { islandOf } from '$lib/museum.js';
  import { t } from '$lib/i18n.js';
  import { visited, markVisited } from '$lib/visited.svelte.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const T = $derived(t(data.lang));
  const GUIDE = $derived({ ja: GJA, en: GEN, ko: GKO }[data.lang] ?? GJA);
  const DATA = $derived({ ja: CJA, en: CEN, ko: CKO }[data.lang] ?? CJA);
  const SEC = $derived(`/${data.lang}/section/fedify`);

  const isle = (id) => islandOf(DATA[id].kind);
  const seen = (id) => visited.ids.includes(id);

  onMount(() => markVisited('guide'));
</script>

<svelte:head><title>{T.guide.title} — {T.site.fediTitle}</title></svelte:head>

<div class="sheet">
  <div class="backline"><a href="{SEC}/#guide">{T.guide.backToMap}</a></div>

  <header class="plaque">
    <div class="kind">{T.guide.kind}</div>
    <h1>{T.guide.title}</h1>
    <div class="langline"><LangSwitch {lang} /></div>
  </header>

  {#each GUIDE.intro as p}<p>{@html p}</p>{/each}

  <h2>{T.guide.journey}</h2>
  <ol class="journey">
    {#each GUIDE.steps as s}
      <li>
        <div class="j-head">
          <span class="j-title">{s.title}</span>
          <a class="j-room {seen(s.room) ? 'seen' : 'unseen'}" href="{SEC}/rooms/{s.room}/">→ {DATA[s.room].name}</a>
          <span class="isle" style="color:{isle(s.room).color}">{T.islands[isle(s.room).key]}</span>
        </div>
        <p>{@html s.text}</p>
      </li>
    {/each}
  </ol>

  {#each GUIDE.outro as p}<p>{@html p}</p>{/each}

  <h2>{T.guide.lost}</h2>
  <div class="chips">
    <a href="{SEC}/rooms/kotoba/">{T.guide.glossary}</a>
    <a href="{SEC}/rooms/webfinger/" class={seen('webfinger') ? 'seen' : 'unseen'}>{T.guide.routeStart}</a>
  </div>

  <nav class="route">
    <span></span>
    <a class="to-map" href="{SEC}/">{T.room.map}</a>
    <span></span>
  </nav>
</div>

<style>
  .langline{margin-top:8px}
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
