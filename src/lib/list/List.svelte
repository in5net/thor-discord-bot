<script lang="ts">
  export let title = "";
</script>

<div>
  {#if title}
    <h3>{title}</h3>
  {/if}
  <div class="list">
    <slot />
  </div>
</div>

<style>
  .list {
    border: 1px solid var(--accent);
    border-radius: 5px;
  }
</style>
