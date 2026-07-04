<script>
  import Ed25519 from '$lib/toys/Ed25519.svelte';
  import Sha256 from '$lib/toys/Sha256.svelte';
  import Webfinger from '$lib/toys/Webfinger.svelte';
  import VocabJson from '$lib/toys/VocabJson.svelte';
  import Prime from '$lib/toys/Prime.svelte';
  import Canon from '$lib/toys/Canon.svelte';
  import EcCurve from '$lib/toys/EcCurve.svelte';
  import Queue from '$lib/toys/Queue.svelte';
  import Pkce from '$lib/toys/Pkce.svelte';

  const registry = {
    ed25519: Ed25519, sha256: Sha256, webfinger: Webfinger, vocabjson: VocabJson,
    prime: Prime, canon: Canon, eccurve: EcCurve, queue: Queue, pkce: Pkce,
  };
  let { id } = $props();
  // 部屋から部屋へ渡るとき、idが変わったら別のおもちゃに入れ替わるように
  const C = $derived(registry[id]);
</script>

{#if C}
  <div class="toy"><C /></div>
{/if}
