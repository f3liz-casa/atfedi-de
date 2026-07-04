<script>
  import '../app.css';
  import { onNavigate, afterNavigate } from '$app/navigation';
  import { onMount, setContext } from 'svelte';
  import { page } from '$app/state';
  import { ui } from '$lib/ui.svelte.js';
  import { initVisited } from '$lib/visited.svelte.js';
  import { t, LANGS } from '$lib/i18n.js';
  import { CAPTIONS as CJA } from '$lib/map/captions.ja.js';
  import { CAPTIONS as CEN } from '$lib/map/captions.en.js';
  import { CAPTIONS as CKO } from '$lib/map/captions.ko.js';

  const CAPS = { ja: CJA, en: CEN, ko: CKO };

  let { children } = $props();
  let reduced = false;
  const SITE = 'https://museum.atfedi.de';

  const lang = $derived(page.params?.lang ?? 'ja');
  const T = $derived(t(lang));

  // おもちゃたちが自分の言語の台詞を引けるように
  setContext('museum:lang', () => page.params?.lang ?? 'ja');

  onMount(() => {
    initVisited();
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // 言語別のパス(hreflang用): 先頭の言語部分を差し替える
  const altPath = (l) => {
    const rest = page.url.pathname.replace(/^\/(ja|en|ko)(?=\/|$)/, '');
    return `/${l}${rest || '/'}`;
  };

  // ページ間の移動に「扉の間(ま)」を挟む。夜(レンズ)からは中央から明ける
  onNavigate((nav) => {
    if (reduced || (nav.type !== 'link' && nav.type !== 'goto')) return;
    const rid = nav.to?.route?.id;
    const dl = nav.to?.params?.lang ?? lang;
    const D = t(dl);
    let kind = D.door.mapKind, name = D.door.mapName;
    if (rid === '/[lang]/section/fedify/rooms/[id]') {
      const meta = CAPS[dl]?.[nav.to.params.id];
      if (meta) ({ kind, name } = meta);
    } else if (rid === '/[lang]/section/fedify/rooms/guide') {
      kind = D.door.annaiKind; name = D.door.guideName;
    } else if (rid === '/[lang]/section/fedify/rooms/kotoba') {
      kind = D.door.annaiKind; name = D.door.kotobaName;
    } else if (rid === '/[lang]') {
      kind = D.door.lobbyKind; name = D.door.lobbyName;
    }
    const night = ui.lens;
    ui.door = { open: true, kind, name, dawn: false };
    if (night) requestAnimationFrame(() => requestAnimationFrame(() => { ui.door.dawn = true; }));
    return new Promise((done) => setTimeout(done, night ? 1850 : 950));
  });

  afterNavigate(() => {
    ui.door = { ...ui.door, open: false, dawn: false };
  });
</script>

<svelte:head>
  <meta name="description" content={T.site.description} />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="canonical" href="{SITE}{page.url.pathname}" />
  {#each LANGS as l}
    <link rel="alternate" hreflang={l} href="{SITE}{altPath(l)}" />
  {/each}
  <meta name="theme-color" content="#E9E3D0" />
  <meta property="og:site_name" content={T.site.title} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{SITE}{page.url.pathname}" />
</svelte:head>

<div id="door" class:open={ui.door.open} class:dawn={ui.door.dawn} class:night={ui.lens} aria-hidden="true">
  <div class="dawnlight"></div>
  <div class="d-kind">{ui.door.kind}</div>
  <div class="d-name">{ui.door.name}</div>
  <div class="d-dots">・・・</div>
</div>

{@render children()}
