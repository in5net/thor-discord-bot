<script lang="ts">
  import { goto } from "$app/navigation";
  import { formatTime } from "$lib/time";
  import type { SongJSONType } from "$src/music/songs";
  import { deepEquals } from "@iz7n/std/object";
  import { nanoid } from "nanoid";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  export let id = "";
  export let name = "";
  export let songs: SongJSONType[] = [];

  let items = songs.map(song => ({ id: nanoid(), song }));

  const oldName = name;
  const oldItems = [...items];
  $: canSave = name !== oldName || !deepEquals(items, oldItems);

  const flipDurationMs = 300;
  function handleDndCards(e: CustomEvent<{ items: typeof items }>) {
    ({ items } = e.detail);
  }

  let showAdd = false;
  let query = "";
  async function add() {
    const response = await fetch(
      `/api/playlist/song/query?q=${encodeURIComponent(query)}`,
    );
    const result = await response.json();

    const { songs } = result;
    items = [...items, ...songs.map(song => ({ id: nanoid(), song }))];

    query = "";
    showAdd = false;
  }

  async function save() {
    const songs = items.map(x => x.song);
    if (id) {
      await fetch(`/api/playlist/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          songs,
        }),
      });
    } else {
      await fetch("/api/playlist", {
        method: "POST",
        body: JSON.stringify({
          name,
          songs,
        }),
      });
    }
    goto("/playlists");
  }
</script>

<input type="text" bind:value={name} />

<button disabled={!canSave} on:click={save}>Save</button>

<button on:click={() => (showAdd = true)}>Add</button>

<ol
  on:consider={handleDndCards}
  on:finalize={handleDndCards}
  use:dndzone={{ items, flipDurationMs }}
>
  {#each items as { id, song: { title, duration } } (id)}
    <li animate:flip={{ duration: flipDurationMs }}>
      {formatTime(duration)} - {title}
      <button on:click={() => (items = items.filter(x => x.id !== id))}>
        Remove
      </button>
    </li>
  {/each}
</ol>

{#if showAdd}
  <div>
    <label>
      Query:
      <textarea bind:value={query} />
    </label>
    <button on:click={() => (showAdd = false)}>Cancel</button>
    <button disabled={!query} on:click={add}>Add</button>
  </div>
{/if}
