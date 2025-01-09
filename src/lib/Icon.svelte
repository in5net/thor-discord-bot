<script context="module" lang="ts">
  const icon2Path = import.meta.glob<string>("./icons/**.svg", {
    query: "?raw",
    eager: true,
    import: "default",
  });
</script>

<script lang="ts">
  export let type: string;
  export let size = 20;
  export let color = "text";
  export let strokeWidth = 1.5;

  $: svg = icon2Path[`./icons/${type}.svg`];
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
