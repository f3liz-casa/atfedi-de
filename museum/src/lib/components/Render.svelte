<script>
  // Markdocの木を歩いて描く。独自タグはSvelteコンポーネントに渡す
  import Self from './Render.svelte';
  import Sutra from './Sutra.svelte';
  import Toy from './Toy.svelte';
  import ShikiHtml from './ShikiHtml.svelte';

  let { node } = $props();
  const comps = { Sutra, Toy, shikihtml: ShikiHtml };
  const isTag = (n) => n && typeof n === 'object' && typeof n.name === 'string';
</script>

{#if Array.isArray(node)}
  {#each node as child}<Self node={child} />{/each}
{:else if typeof node === 'string' || typeof node === 'number'}
  {node}
{:else if isTag(node)}
  {#if comps[node.name]}
    {@const C = comps[node.name]}
    <C {...node.attributes}><Self node={node.children} /></C>
  {:else if node.children?.length}
    <svelte:element this={node.name} {...node.attributes}><Self node={node.children} /></svelte:element>
  {:else}
    <svelte:element this={node.name} {...node.attributes} />
  {/if}
{/if}
