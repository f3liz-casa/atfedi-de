<script>
  // グラフの書庫: 書き方だけ違う二つの文書を、並べ直して影を比べる
  import { getContext } from 'svelte';
  import { t } from '$lib/i18n.js';
  const T = t(getContext('museum:lang')()).toys.canon;

  const docA = '{"type":"Note","content":"hello","to":["as:Public"]}';
  const docB = '{"to":["as:Public"],"content":"hello","type":"Note"}';
  let result = $state(null);

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
<button onclick={compare}>{T.compare}</button>
{#if result}
  <div class="mono">
    {T.raw}&nbsp;&nbsp; {result.ra} / {result.rb} → <span class="bad">{T.diff}</span><br />
    {T.canon} {result.ha} / {result.hb} → <span class="ok">{T.same}</span>
  </div>
{:else}
  <div class="mono">{T.initial}</div>
{/if}
