<script lang="ts">
  import Button from "$src/lib/Button.svelte";
  import Textarea from "$src/lib/Textarea.svelte";

  interface Props {
    words?: string;
    responses?: string;
    chance?: number;
    cooldown?: number;
    extraCanSave?: boolean;
  }

  let {
    words = $bindable(""),
    responses = $bindable(""),
    chance = $bindable(10),
    cooldown = $bindable(0),
    extraCanSave = true,
  }: Props = $props();

  const canSave = $derived(!!words && !!responses && extraCanSave);
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
