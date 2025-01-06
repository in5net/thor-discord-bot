<script lang="ts">
  import { deepEquals } from "@iz7n/std/object";

  export let data;
  const { response } = data;
  let { words, responses, cooldown } = response;
  let chance = response.chance * 100;

  const old = { words, responses, chance, cooldown };
  $: values = { words, responses, chance, cooldown };
  $: canSave = !deepEquals(values, old);
</script>

<form action="?/save" method="POST">
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
  <button formaction="?/delete">Delete</button>
</form>
