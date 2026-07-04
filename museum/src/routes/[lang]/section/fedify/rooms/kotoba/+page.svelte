<script>
  import LangSwitch from '$lib/components/LangSwitch.svelte';
  import { GLOSSARY as GJA } from '$lib/guide-data.ja.js';
  import { GLOSSARY as GEN } from '$lib/guide-data.en.js';
  import { GLOSSARY as GKO } from '$lib/guide-data.ko.js';
  import { CAPTIONS as CJA } from '$lib/map/captions.ja.js';
  import { CAPTIONS as CEN } from '$lib/map/captions.en.js';
  import { CAPTIONS as CKO } from '$lib/map/captions.ko.js';
  import { t } from '$lib/i18n.js';
  import { visited } from '$lib/visited.svelte.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const T = $derived(t(data.lang));
  const GLOSSARY = $derived({ ja: GJA, en: GEN, ko: GKO }[data.lang] ?? GJA);
  const DATA = $derived({ ja: CJA, en: CEN, ko: CKO }[data.lang] ?? CJA);
  const SEC = $derived(`/${data.lang}/section/fedify`);

  const seen = (id) => visited.ids.includes(id);
</script>

<svelte:head><title>{T.kotoba.title} — {T.site.fediTitle}</title></svelte:head>

<div class="sheet">
  <div class="backline"><a href="{SEC}/">{T.guide.backToMap}</a></div>

  <header class="plaque">
    <div class="kind">{T.kotoba.kind}</div>
    <h1>{T.kotoba.title}</h1>
    <div class="langline"><LangSwitch {lang} /></div>
  </header>

  <p>{T.kotoba.intro}</p>

  <div class="files">
    {#each GLOSSARY as g}
      <div class="file">
        <b>{g.term}</b>
        <div class="what">{g.desc}</div>
        <div class="g-room">
          <a href="{SEC}/rooms/{g.room}/" class={seen(g.room) ? 'seen' : 'unseen'}>→ {DATA[g.room].name}</a>
        </div>
      </div>
    {/each}
  </div>

  <nav class="route">
    <span></span>
    <a class="to-map" href="{SEC}/">{T.room.map}</a>
    <span></span>
  </nav>
</div>

<style>
  .langline{margin-top:8px}
  .file b{font-size:.9rem}
  .g-room{margin-top:5px; font-size:.78rem}
  .g-room a{color:var(--ink-soft); text-decoration:none; border-bottom:1px solid var(--shu)}
  .g-room a::before{
    content:""; display:inline-block; width:8px; height:8px; border-radius:50%;
    border:1.5px solid var(--shu); background:var(--wall); margin-right:6px}
  :global(.g-room a.seen)::before{background:var(--shu)}
</style>
