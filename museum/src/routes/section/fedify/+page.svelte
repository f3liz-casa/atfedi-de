<script>
  import Map from '$lib/map/Map.svelte';
  let { data } = $props();
</script>

<Map available={data.available} />
