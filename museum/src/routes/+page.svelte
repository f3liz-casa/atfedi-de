<script>
  // 博物街の玄関。街区(セクション)は、これから増えていく
  const SECTIONS = [
    {
      href: '/section/fedify/',
      title: 'フェディの博物街',
      kind: 'フェディの街区',
      desc: 'fedify・hollo・hackers.pub という三つのオープンソースを、歩いて回れる街にしました。26の展示室、さわれる動くおもちゃ、そして夜になるレンズ——かけると、海の底に数学の隠れ街が見えます。',
      note: '地図から、どうぞ。はじめての方は門のそばの案内所へ。',
    },
  ];
</script>

<svelte:head><title>博物街 — museum.atfedi.de</title></svelte:head>

<div class="sheet">
  <header class="plaque">
    <div class="kind">museum.atfedi.de</div>
    <h1>博物街</h1>
  </header>

  <p>見て回れる、ちいさな展示の街です。街区(セクション)ごとに、ひとつの世界を歩けます。</p>

  <h2>ひらいている街区</h2>
  <div class="sections">
    {#each SECTIONS as s}
      <a class="section-card" href={s.href}>
        <div class="kind">{s.kind}</div>
        <div class="s-title">{s.title}</div>
        <p>{s.desc}</p>
        <div class="s-note">{s.note}</div>
      </a>
    {/each}
  </div>

  <h2>これから建つ街区</h2>
  <!-- 建設予定(看板にはまだ出さない):
       ・数学の街区 — 証明や計算の、さわれる展示
       ・日常のこと — くらしの中の、ちいさな発見の陳列棚 -->
  <div class="sections">
    <div class="section-card coming">
      <div class="s-title">つぎの街区</div>
      <p>いま、しずかに準備中です。</p>
    </div>
  </div>

  <nav class="route">
    <span></span>
    <a class="to-map" href="https://atfedi.de/">atfedi.de</a>
    <span></span>
  </nav>
</div>

<style>
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
  .section-card.coming .s-note{color:var(--ink-soft)}
</style>
