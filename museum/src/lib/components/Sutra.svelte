<script>
  import { GH } from '$lib/museum.js';
  let { path, lines, note, repo = 'fedify', children } = $props();
</script>

<figure class="sutra">
  {@render children?.()}
  <figcaption>
    <a href="{GH[repo]}{path}#{lines}" target="_blank" rel="noopener">{path} {lines}</a>{#if note}
      — {note}{/if}
  </figcaption>
</figure>
