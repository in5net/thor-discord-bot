<script lang="ts">
  import Modal from "$lib/Modal.svelte";
  import Button from "$src/lib/Button.svelte";
  import Input from "$src/lib/Input.svelte";
  import Item from "$src/lib/list/Item.svelte";
  import List from "$src/lib/list/List.svelte";
  import Textarea from "$src/lib/Textarea.svelte";

  import { goto } from "$app/navigation";
  import { formatTime } from "$lib/time";
  import type { PlaylistItemJSON } from "$src/music/songs";
  import { deepEquals } from "@iz7n/std/object";
  import { sum } from "@iz7n/std/stats";
  import { nanoid } from "nanoid";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  export let id = "";
  export let name = "";
  export let songs: PlaylistItemJSON[] = [];

  let items = songs.map(item => ({ id: nanoid(), item }));

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
    items = [...items, ...songs.map(item => ({ id: nanoid(), item }))];

    query = "";
    showAdd = false;
  }

  async function save() {
    const songs = items.map(x => x.item);
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

<Input label="Playlist name" bind:value={name} />

<div class="mb">
  <Button disabled={!canSave} on:click={save}>Save</Button>
  <Button on:click={() => (showAdd = true)}>Add</Button>
</div>

<List>
  <div
    on:consider={handleDndCards}
    on:finalize={handleDndCards}
    use:dndzone={{ items, flipDurationMs }}
  >
    {#each items as { id, item }, i (id)}
      <div animate:flip={{ duration: flipDurationMs }}>
        {#if item.type === "playlist"}
          <Item
            label="{i + 1}. PLAYLIST: {formatTime(
              sum(item.songs.map(x => x.duration)),
            )} - {item.name}"
          >
            <Button on:click={() => (items = items.filter(x => x.id !== id))}>
              Remove
            </Button>
          </Item>
        {:else}
          <Item label="{i + 1}. {formatTime(item.duration)} - {item.title}">
            <Button on:click={() => (items = items.filter(x => x.id !== id))}>
              Remove
            </Button>
          </Item>
        {/if}
      </div>
    {/each}
  </div>
</List>

{#if showAdd}
  <Modal
    btnLabel="Save"
    disabled={!query}
    on:action={add}
    on:close={() => (showAdd = false)}
  >
    <Textarea label="Query" bind:value={query} />
  </Modal>
{/if}

<style>
  .mb {
    margin-bottom: 8px;
  }
</style>
