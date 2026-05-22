<script lang="ts">
  // Category filter — the one interactive island on a catalog page.
  //
  // Note there is no <style> block here. This component relies entirely on the
  // shared classes (.chip, .chip-row) and tokens from src/styles/. That is the
  // proof that a Svelte component reuses the site's styling with nothing
  // copied — a future standalone Svelte app importing the same CSS gets the
  // identical look.
  //
  // The tool cards are rendered server-side by Astro (good for SEO, works
  // without JS). This island just shows/hides them via the `hidden` attribute.

  type Category = { key: string; label: string };

  let { categories = [], allLabel = 'All' }: { categories?: Category[]; allLabel?: string } =
    $props();

  let active = $state('all');

  function select(key: string) {
    active = key;
    for (const card of document.querySelectorAll<HTMLElement>('.tool-card')) {
      const cat = card.getAttribute('data-category');
      card.hidden = key !== 'all' && cat !== key;
    }
  }
</script>

<div class="chip-row" role="group" aria-label="Filter by category">
  <button class="chip" aria-pressed={active === 'all'} onclick={() => select('all')}>
    {allLabel}
  </button>
  {#each categories as cat (cat.key)}
    <button class="chip" aria-pressed={active === cat.key} onclick={() => select(cat.key)}>
      {cat.label}
    </button>
  {/each}
</div>
