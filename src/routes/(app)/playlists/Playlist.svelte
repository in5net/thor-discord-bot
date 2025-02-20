<script lang="ts">
  import Modal from "$lib/Modal.svelte";
  import Button from "$src/lib/Button.svelte";
  import Icon from "$src/lib/Icon.svelte";
  import Input from "$src/lib/Input.svelte";
  import Item from "$src/lib/list/Item.svelte";
  import List from "$src/lib/list/List.svelte";
  import Textarea from "$src/lib/Textarea.svelte";
  import EditSongList from "./EditSongList.svelte";
  import SongList from "./SongList.svelte";

  import { goto } from "$app/navigation";
  import { formatTime } from "$src/lib/time";
  import type {
    PlaylistItemJSON,
    YoutubePlaylistJSON,
    SongGroupJSON,
  } from "$src/music/songs";
  import { deepEquals } from "@in5net/std/object";
  import { sum } from "@in5net/std/stats";
  import { quantify } from "@in5net/std/string";
  import { nanoid } from "nanoid";

  interface Props {
    id?: string;
    name?: string;
    songs?: PlaylistItemJSON[];
  }

  let { id = "", name = $bindable(""), songs = [] }: Props = $props();

  let items = $state(songs.map(item => ({ id: nanoid(), item })));

  const oldName = name;
  const oldItems = [...items];
  const canSave = $derived(name !== oldName || !deepEquals(items, oldItems));

  let selected: string[] = $state([]);

  let showAdd = $state(false);
  let query = $state("");
  let spinner = $state(false);
  async function add() {
    spinner = true;
    const response = await fetch(
      `/api/playlist/song/query?q=${encodeURIComponent(query)}`,
    );
    const result = await response.json();

    const { items: songs } = result;
    items = [...items, ...songs.map(item => ({ id: nanoid(), item }))];

    query = "";
    showAdd = false;
    spinner = false;
  }

  let selectedPlaylist: YoutubePlaylistJSON | SongGroupJSON | undefined =
    $state();

  let showMove = $state(false);
  let moveGroupId = $state("");

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

<div class="flex mb">
  <Button disabled={!canSave} onclick={save}>
    <Icon type="upload" />
    Save
  </Button>
  <Button onclick={() => (showAdd = true)}>
    <Icon type="playlist-add" />
    Add
  </Button>
  <Button
    onclick={() =>
      items.unshift({
        id: nanoid(),
        item: {
          type: "group",
          name: "New Group",
          songs: [],
        },
      })}
  >
    Create group
  </Button>
  <Button disabled={!selected.length} onclick={() => (showMove = true)}>
    Move into group
  </Button>
</div>

<SongList
  onclick={item => {
    if (item.type === "playlist" || item.type === "group") {
      selectedPlaylist = item;
    }
  }}
  bind:selected
  bind:items
/>

{#if selectedPlaylist}
  <EditSongList
    name={selectedPlaylist.name}
    onclose={() => (selectedPlaylist = undefined)}
    onmoveup={songs =>
      items.push(...songs.map(x => ({ id: nanoid(), item: x })))}
    onsave={({ name, songs }) => {
      const index = items.findIndex(x => x.item === selectedPlaylist);
      items = items.with(index, {
        id: nanoid(),
        item: {
          ...selectedPlaylist,
          name,
          songs,
        },
      });
      selectedPlaylist = undefined;
    }}
    songs={selectedPlaylist.songs}
  />
{/if}

{#if showAdd}
  <Modal
    btnLabel="Save"
    disabled={!query}
    onaction={add}
    onclose={() => (showAdd = false)}
    {spinner}
  >
    <Textarea label="Query" bind:value={query} />
  </Modal>
{/if}

{#if showMove}
  <Modal
    btnLabel="Move"
    disabled={!moveGroupId}
    onaction={() => {
      const index = items.findIndex(x => x.id === moveGroupId);
      const item = items[index];
      if (item?.item.type === "group") {
        items = items
          .with(index, {
            id: item.id,
            item: {
              ...item.item,
              songs: [
                ...item.item.songs,
                ...selected.map(id => items.find(x => x.id === id)?.item),
              ],
            },
          })
          .filter(x => !selected.includes(x.id));
      }
      moveGroupId = "";
      selected = [];
      showMove = false;
    }}
    onclose={() => {
      moveGroupId = "";
      showMove = false;
    }}
  >
    <List title="Song groups">
      {#each items as { id, item }}
        {#if item.type === "group"}
          <Item
            checked={moveGroupId === id}
            description="{quantify('song', item.songs.length)}・{formatTime(
              sum(item.songs.map(x => x.duration)),
            )}"
            icon="playlist"
            label=" {item.name}"
            onclick={() => (moveGroupId = id)}
          />
        {/if}
      {/each}
    </List>
  </Modal>
{/if}

<style>
  .flex {
    display: flex;
    gap: 8px;
  }
  .mb {
    margin-bottom: 8px;
  }
</style>
