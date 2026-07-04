<script>
  // 言語の切り替え。いまのページの言語部分だけ差し替える
  import { page } from '$app/state';
  import { LANGS } from '$lib/i18n.js';

  let { lang } = $props();
  const rest = $derived(page.url.pathname.replace(/^\/(ja|en|ko)(?=\/|$)/, '') || '/');
</script>

<span class="langswitch">
  {#each LANGS as l, i}
    {#if i > 0}<span class="sep">·</span>{/if}
    {#if l === lang}
      <b>{l}</b>
    {:else}
      <a href="/{l}{rest}" data-sveltekit-reload>{l}</a>
    {/if}
  {/each}
</span>

<style>
  .langswitch{font-size:.72rem; letter-spacing:.08em;
    font-family:ui-monospace,"SF Mono",Menlo,monospace; color:var(--ink-soft)}
  .langswitch .sep{margin:0 5px; opacity:.5}
  .langswitch a{color:var(--ink-soft); text-decoration:none;
    border-bottom:1px solid var(--shu)}
  .langswitch b{color:var(--shu)}
</style>
