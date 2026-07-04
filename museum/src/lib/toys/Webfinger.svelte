<script>
  // ほんものの電話帳(WebFinger)を引くおもちゃ
  import { getContext } from 'svelte';
  import { t } from '$lib/i18n.js';
  const T = t(getContext('museum:lang')()).toys.webfinger;

  let addr = $state('@hongminhee@hackers.pub');
  let url = $state('');
  let out = $state(T.initial);

  async function lookup() {
    const m = addr.trim().replace(/^@/, '').split('@');
    if (m.length !== 2 || !m[0] || !m[1]) { out = T.badAddr; return; }
    url = `https://${m[1]}/.well-known/webfinger?resource=acct:${m[0]}@${m[1]}`;
    out = T.crossing;
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
      out = T.failed(e.message);
    }
  }
</script>

<div class="row">
  <input type="text" bind:value={addr} />
  <button onclick={lookup}>{T.lookup}</button>
</div>
{#if url}<div class="mono">GET {url}</div>{/if}
<pre>{out}</pre>
