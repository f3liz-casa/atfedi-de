<script>
  // ほんものの電話帳(WebFinger)を引くおもちゃ
  let addr = $state('@hongminhee@hackers.pub');
  let url = $state('');
  let out = $state('宛名を入れて「しらべる」——ほんものの電話帳を引きます。');

  async function lookup() {
    const m = addr.trim().replace(/^@/, '').split('@');
    if (m.length !== 2 || !m[0] || !m[1]) { out = '宛名は @名前@ホスト の形で。'; return; }
    url = `https://${m[1]}/.well-known/webfinger?resource=acct:${m[0]}@${m[1]}`;
    out = '海を渡っています……';
    try {
      const res = await fetch(url, { headers: { Accept: 'application/jrd+json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const jrd = await res.json();
      const lines = ['subject: ' + jrd.subject];
      for (const l of jrd.links || []) {
        lines.push(`link[${l.rel || ''}] ${l.type || ''}`);
        lines.push('  -> ' + (l.href || l.template || ''));
      }
      out = lines.join('\n');
    } catch (e) {
      out = `届きませんでした(${e.message})。島が留守か、CORSの垣根です。\n` +
        'でも上のURLが、実際に引かれる電話帳のページ——ブラウザで直接開けます。';
    }
  }
</script>

<div class="row">
  <input type="text" bind:value={addr} />
  <button onclick={lookup}>しらべる</button>
</div>
{#if url}<div class="mono">GET {url}</div>{/if}
<pre>{out}</pre>
