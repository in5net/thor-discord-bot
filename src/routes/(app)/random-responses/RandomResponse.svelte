<script lang="ts">
  import Button from "$src/lib/Button.svelte";
  import Textarea from "$src/lib/Textarea.svelte";

  export let words = "";
  export let responses = "";
  export let chance = 10;
  export let cooldown = 0;
  export let extraCanSave = true;

  $: canSave = !!words && !!responses && extraCanSave;
</script>

<Textarea name="words" label="Triggers" bind:value={words} />
<Textarea name="responses" label="Responses" bind:value={responses} />
<div>
  <label>
    Chance:
    <input name="chance" type="number" bind:value={chance} />%
  </label>
</div>
<div>
  <label>
    Cooldown:
    <input name="cooldown" type="number" bind:value={cooldown} />s
  </label>
</div>
<Button disabled={!canSave}>Save</Button>
