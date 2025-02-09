<script lang="ts">
  import RandomResponse from "../RandomResponse.svelte";

  import { deepEquals } from "@in5net/std/object";

  const { data } = $props();
  const { response } = data;
  let { words, responses, cooldown } = $state(response);
  let chance = $state(response.chance * 100);

  const old = { words, responses, chance, cooldown };
  const values = $derived({ words, responses, chance, cooldown });
  const canSave = $derived(!deepEquals(values, old));
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
