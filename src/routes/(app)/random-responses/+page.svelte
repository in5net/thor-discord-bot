<script lang="ts">
  import { goto } from "$app/navigation";

  export let data;
  const { randomResponses } = data;
</script>

<h3>Random responses</h3>
<a href="/random-responses/add">Add</a>

{#each randomResponses as { id, words, responses, chance, cooldown }}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="item" on:click={() => goto(`/random-responses/${id}`)}>
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

<style>
  .item {
    border: 1px solid black;
    cursor: pointer;
    display: grid;
    grid-template-columns: 1fr 150px;
  }
  .cell-row {
    display: flex;
    gap: 3px;
  }
  .cell {
    border: 1px solid gray;
    border-radius: 3px;
    background-color: lightgray;
  }
</style>
