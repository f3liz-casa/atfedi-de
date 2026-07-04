<script>
  // 博物街の玄関。街区(セクション)は、これから増えていく
  import { t } from '$lib/i18n.js';
  import LangSwitch from '$lib/components/LangSwitch.svelte';

  let { data } = $props();
  const T = $derived(t(data.lang));
</script>

<svelte:head><title>{T.site.title} — museum.atfedi.de</title></svelte:head>

<div class="sheet">
  <header class="plaque">
    <div class="kind">{T.lobby.kind}</div>
    <h1>{T.lobby.h1}</h1>
    <div class="langline"><LangSwitch lang={data.lang} /></div>
  </header>

  <p>{T.lobby.intro}</p>

  <h2>{T.lobby.open}</h2>
  <div class="sections">
    <a class="section-card" href="/{data.lang}/section/fedify/">
      <div class="kind">{T.lobby.fedi.kind}</div>
      <div class="s-title">{T.lobby.fedi.title}</div>
      <p>{T.lobby.fedi.desc}</p>
      <div class="s-note">{T.lobby.fedi.note}</div>
    </a>
  </div>

  <h2>{T.lobby.coming}</h2>
  <!-- 建設予定(看板にはまだ出さない):
       ・数学の街区 — 証明や計算の、さわれる展示
       ・日常のこと — くらしの中の、ちいさな発見の陳列棚 -->
  <div class="sections">
    <div class="section-card coming">
      <div class="s-title">{T.lobby.comingTitle}</div>
      <p>{T.lobby.comingDesc}</p>
    </div>
  </div>

  <nav class="route">
    <span></span>
    <a class="to-map" href="https://atfedi.de/">atfedi.de</a>
    <span></span>
  </nav>
</div>

<style>
  .langline{margin-top:8px}
  .sections{display:flex; flex-direction:column; gap:14px}
  .section-card{display:block; background:var(--card); border:1.5px solid var(--ink);
    border-radius:3px; box-shadow:3px 3px 0 rgba(59,55,46,.16);
    padding:18px 22px; text-decoration:none; color:var(--ink);
    transition:transform .15s ease, box-shadow .15s ease}
  a.section-card:hover{transform:translate(-1px,-1px); box-shadow:5px 5px 0 rgba(59,55,46,.18)}
  .s-title{font-family:"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif;
    font-weight:600; font-size:1.25rem; letter-spacing:.14em; margin:6px 0 4px}
  .section-card p{font-size:.88rem; margin-bottom:8px}
  .s-note{font-size:.75rem; color:var(--shu); letter-spacing:.08em}
  .section-card.coming{border-style:dashed; box-shadow:none; opacity:.75}
</style>
