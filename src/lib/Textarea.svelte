<script lang="ts">
  interface Props {
    label: string;
    value?: string;
    [key: string]: any;
  }

  let { label, value = $bindable(""), ...rest }: Props = $props();
</script>

<label>
  <div>{label}</div>
  <textarea {...rest} bind:value></textarea>
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
