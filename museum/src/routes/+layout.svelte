<script>
  import '../app.css';
  import { onNavigate, afterNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { ui } from '$lib/ui.svelte.js';
  import { initVisited } from '$lib/visited.svelte.js';
  import { DATA } from '$lib/map/data.js';

  let { children } = $props();
  let reduced = false;
  const SITE = 'https://museum.atfedi.de';

  onMount(() => {
    initVisited();
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // ページ間の移動に「扉の間(ま)」を挟む。夜(レンズ)からは中央から明ける
  onNavigate((nav) => {
    if (reduced || (nav.type !== 'link' && nav.type !== 'goto')) return;
    const rid = nav.to?.route?.id;
    let kind = 'フェディの街区', name = '地図';
    if (rid === '/section/fedify/rooms/[id]') {
      const meta = DATA[nav.to.params.id];
      if (meta) ({ kind, name } = meta);
    } else if (rid === '/section/fedify/rooms/guide') {
      kind = 'ごあんない'; name = '案内所';
    } else if (rid === '/section/fedify/rooms/kotoba') {
      kind = 'ごあんない'; name = 'ことばの栞';
    } else if (rid === '/') {
      kind = 'museum.atfedi.de'; name = '博物街の玄関';
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
  <meta name="description"
    content="fedify・hollo・hackers.pub という三つのオープンソースを、歩いて回れる博物街にした地図。展示室には動くおもちゃ、レンズをかけると数学の隠れ街。" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="canonical" href="{SITE}{page.url.pathname}" />
  <meta name="theme-color" content="#E9E3D0" />
  <meta property="og:site_name" content="フェディの博物街" />
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
