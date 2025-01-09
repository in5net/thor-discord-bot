<script lang="ts">
  export let words = "";
  export let responses = "";
  export let chance = 10;
  export let cooldown = 0;
  export let extraCanSave = true;

  $: canSave = !!words && !!responses && extraCanSave;
</script>

<div>
  <label>
    Triggers:
    <textarea name="words" bind:value={words} />
  </label>
</div>
<div>
  <label>
    Responses:
    <textarea name="responses" bind:value={responses} />
  </label>
</div>
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
<button disabled={!canSave}>Save</button>
