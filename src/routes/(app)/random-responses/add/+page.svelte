<script lang="ts">
  let words = "";
  let responses = "";
  let chance = 10;
  let cooldown = 0;

  $: canSave = !!words && !!responses;
</script>

<form method="POST">
  <label>
    Triggers:
    <input name="words" type="text" bind:value={words} />
  </label>
  <label>
    Responses:
    <input name="responses" type="text" bind:value={responses} />
  </label>
  <label>
    Chance:
    <input name="chance" type="number" bind:value={chance} />%
  </label>
  <label>
    Cooldown:
    <input name="cooldown" type="number" bind:value={cooldown} />s
  </label>
  <button disabled={!canSave}>Save</button>
</form>
