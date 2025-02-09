<script lang="ts">
  interface Props {
    title?: string;
    children?: import('svelte').Snippet;
  }

  let { title = "", children }: Props = $props();
</script>

<div>
  {#if title}
    <h3>{title}</h3>
  {/if}
  <div class="list">
    {@render children?.()}
  </div>
</div>

<style>
  .list {
    border: 1px solid var(--accent);
    border-radius: 5px;
  }
</style>
