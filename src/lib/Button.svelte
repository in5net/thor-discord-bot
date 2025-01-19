<script lang="ts">
</script>

<button {...$$restProps} on:click>
  <slot />
</button>

<style>
  button {
    border: 1px solid var(--accent);
    border-radius: 4px;
    padding: 2px 4px;
    outline: none;
    background: none;
    color: var(--text);
    cursor: pointer;
  }
  button:disabled {
    color: var(--text-hover);
    cursor: not-allowed;
  }
</style>
