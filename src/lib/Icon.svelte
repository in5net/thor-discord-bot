<script lang="ts" module>
  const icon2Path = import.meta.glob<string>("./icons/**.svg", {
    query: "?raw",
    eager: true,
    import: "default",
  });
</script>

<script lang="ts">
  interface Props {
    type: string;
    size?: number;
    color?: string;
    strokeWidth?: number;
  }

  const {
    type,
    size = 20,
    color = "text",
    strokeWidth = 1.5,
  }: Props = $props();

  const svg = $derived(icon2Path[`./icons/${type}.svg`]);
</script>

<div>
  <svg
    fill="none"
    height={size}
    stroke="var(--{color})"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={strokeWidth}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html svg}
  </svg>
</div>

<style>
  div {
    display: grid;
    align-items: center;
    justify-items: center;
  }
</style>
