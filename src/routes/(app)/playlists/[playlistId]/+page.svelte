<script lang="ts">
  import { formatTime } from "$lib/time";
  import { deepEquals } from "@iz7n/std/object";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  export let data;
  let { playlistId, name, songs } = data;

  let oldName = name;
  let oldSongs = [...songs];
  $: canSave = name !== oldName || deepEquals(songs, oldSongs);

  const flipDurationMs = 300;
  function handleDndCards(e: CustomEvent<{ items: typeof songs }>) {
    songs = e.detail.items;
  }

  async function save() {
    await fetch(`/api/playlist/${playlistId}`, {
      method: "PUT",
      body: JSON.stringify({
        name,
        songs,
      }),
    });
    oldName = name;
    oldSongs = songs;
  }
</script>

<input type="text" bind:value={name} />

<button disabled={!canSave} on:click={save}>Save</button>

<ol
  on:consider={handleDndCards}
  on:finalize={handleDndCards}
  use:dndzone={{ items: songs, flipDurationMs }}
>
  {#each songs as { id, data: { title, duration } } (id)}
    <li animate:flip={{ duration: flipDurationMs }}>
      {formatTime(duration)} - {title}
    </li>
  {/each}
</ol>
