<script>
  // あなたの一言が海を渡るときの実寸(Create+Note)。変わった行は蛍光ペンで
  import { getContext } from 'svelte';
  import { t } from '$lib/i18n.js';
  const T = t(getContext('museum:lang')()).toys.vocabjson;

  let text = $state(T.sample);
  let vis = $state('public');
  let html = $state('');
  const published = new Date().toISOString().slice(0, 19) + 'Z'; // 打つたび光らないよう固定
  let prev = null;

  function colorize(line) {
    let e = line.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    e = e.replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="j-key">$1</span>$2');
    e = e.replace(/: ("(?:[^"\\]|\\.)*")/g, ': <span class="j-str">$1</span>');
    e = e.replace(/^(\s*)("(?:[^"\\]|\\.)*")(,?)$/, '$1<span class="j-str">$2</span>$3');
    return e;
  }

  $effect(() => {
    const doc = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: 'https://hollo.example/@you/activities/1',
      type: 'Create',
      actor: 'https://hollo.example/@you',
      to: vis === 'public'
        ? ['https://www.w3.org/ns/activitystreams#Public']
        : ['https://hollo.example/@you/followers'],
      object: { type: 'Note', content: '<p>' + text + '</p>', published },
    };
    const s = JSON.stringify(doc, null, 2);
    if (prev !== null && s === prev.join('\n')) return; // 値が同じなら光をそのまま
    const lines = s.split('\n');
    html = lines
      .map((l, i) => {
        const c = colorize(l);
        return prev !== null && prev[i] !== l ? `<span class="chg-line">${c}</span>` : c;
      })
      .join('\n');
    prev = lines;
  });
</script>

<input type="text" bind:value={text} />
<div class="row">
  <label><input type="radio" bind:group={vis} value="public" /> {T.pub}</label>
  <label><input type="radio" bind:group={vis} value="followers" /> {T.followers}</label>
</div>
<pre class="light">{@html html}</pre>
<div class="hint">{T.hint}</div>
