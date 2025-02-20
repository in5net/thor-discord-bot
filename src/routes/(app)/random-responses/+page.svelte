<script lang="ts">
  import List from "$src/lib/list/List.svelte";

  import { goto } from "$app/navigation";

  const { data } = $props();
  const { randomResponses } = data;
</script>

<a href="/random-responses/add">Add</a>

<List title="Random responses">
  {#each randomResponses as { id, words, responses, chance, cooldown }}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="item" onclick={() => goto(`/random-responses/${id}`)}>
      <div>
        Triggers: <div class="cell-row">
          {#each words.split("|") as word}
            <span class="cell">{word}</span>
          {/each}
        </div>
        Responses:
        <div class="cell-row">
          {#each responses.split("|") as response}
            <span class="cell">{response}</span>
          {/each}
        </div>
      </div>
      <div>
        <div>chance: {Math.round(chance * 100)}%</div>
        <div>cooldown: {cooldown}s</div>
      </div>
    </div>
  {/each}
</List>

<style>
  .item {
    border-bottom: 1px solid var(--accent);
    padding: 4px;
    cursor: pointer;
    display: grid;
    grid-template-columns: 1fr 150px;
  }
  .cell-row {
    display: flex;
    gap: 6px;
  }
  .cell {
    border: 1px solid var(--black-white);
    border-radius: 3px;
    background-color: var(--secondary);
  }
</style>
