<script lang="ts">
  import RandomResponse from "../RandomResponse.svelte";

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
  <RandomResponse
    extraCanSave={canSave}
    bind:words
    bind:responses
    bind:cooldown
    bind:chance
  />
  <button formaction="?/delete">Delete</button>
</form>
