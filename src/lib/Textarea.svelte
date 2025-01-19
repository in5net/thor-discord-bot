<script lang="ts">
  export let label: string;
  export let value = "";
</script>

<label>
  <div>{label}</div>
  <textarea {...$$restProps} bind:value />
</label>

<style>
  textarea {
    font-family: "Brawler";
    border: 1px solid var(--accent);
    border-radius: 4px;
    padding: 10px;
    outline: none;
    background: none;
    font-size: 16px;
    color: var(--text);
    margin-bottom: 1rem;
    display: block;
    width: 100%;
    overflow: auto;
    resize: none;
  }
</style>
