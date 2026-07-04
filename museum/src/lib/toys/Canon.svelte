<script>
  // グラフの書庫: 書き方だけ違う二つの文書を、並べ直して影を比べる
  const docA = '{"type":"Note","content":"こんにちは","to":["as:Public"]}';
  const docB = '{"to":["as:Public"],"content":"こんにちは","type":"Note"}';
  let result = $state(null); // {ra,rb,ha,hb}

  function canon(v) {
    if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
    if (v && typeof v === 'object')
      return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
    return JSON.stringify(v);
  }
  async function sha(s) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('').slice(0, 16);
  }
  async function compare() {
    result = {
      ra: await sha(docA), rb: await sha(docB),
      ha: await sha(canon(JSON.parse(docA))), hb: await sha(canon(JSON.parse(docB))),
    };
  }
</script>

<pre>{docA}</pre>
<pre>{docB}</pre>
<button onclick={compare}>並べ直して、影を比べる</button>
{#if result}
  <div class="mono">
    生のまま:&nbsp;&nbsp; {result.ra} / {result.rb} → <span class="bad">別の影</span><br />
    並べ直して: {result.ha} / {result.hb} → <span class="ok">同じ影</span>
  </div>
{:else}
  <div class="mono">同じ意味の文書がふたつ。書き方(鍵の順番)だけ違います。</div>
{/if}
