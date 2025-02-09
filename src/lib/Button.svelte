<script lang="ts">
  interface Props {
    noBorder?: boolean;
    children?: import("svelte").Snippet;
    [key: string]: any;
  }

  const { noBorder = false, children, ...rest }: Props = $props();
</script>

<button {...rest} class:noBorder>
  {@render children?.()}
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
    display: flex;
    align-items: center;
    gap: 4px;
  }
  button:disabled {
    color: var(--text-hover);
    cursor: not-allowed;
  }
  .noBorder {
    border: 0;
  }
</style>
