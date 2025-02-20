<script lang="ts">
  import Modal from "$lib/Modal.svelte";
  import Button from "$src/lib/Button.svelte";
  import Icon from "$src/lib/Icon.svelte";
  import Input from "$src/lib/Input.svelte";
  import Textarea from "$src/lib/Textarea.svelte";
  import SongList from "./SongList.svelte";

  import type { PlaylistItemJSON } from "$src/music/songs";
  import { deepEquals } from "@in5net/std/object";
  import { nanoid } from "nanoid";

  interface Props {
    name: string;
    songs: PlaylistItemJSON[];
    onsave: (data: { name: string; songs: PlaylistItemJSON[] }) => any;
    onmoveup: (songs: PlaylistItemJSON[]) => any;
    onclose: () => any;
  }
  let { name, songs, onsave, onmoveup, onclose }: Props = $props();

  let items = $state(songs.map(item => ({ id: nanoid(), item })));

  const oldName = name;
  const oldItems = [...items];

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
    items = [
      ...items,
      ...songs.flatMap(item =>
        "type" in item ?
          item.songs.map(x => ({ id: nanoid(), item: x }))
        : [{ id: nanoid(), item }],
      ),
    ];

    query = "";
    showAdd = false;
    spinner = false;
  }

  let selected: string[] = $state([]);
</script>

<Modal
  btnLabel="Save"
  disabled={name === oldName && deepEquals(items, oldItems)}
  onaction={() => onsave({ name, songs: items.map(x => x.item) })}
  {onclose}
>
  <Input label="Group name" bind:value={name} />
  <SongList bind:selected bind:items />

  {#snippet button()}
    <Button onclick={() => (showAdd = true)}>
      <Icon type="playlist-add" />
      Add
    </Button>
    <Button
      disabled={!selected.length}
      onclick={() => {
        onmoveup(selected.map(id => items.find(x => x.id === id)?.item));
        items = items.filter(x => !selected.includes(x.id));
        onsave({ name, songs: items.map(x => x.item) });
        selected = [];
      }}
    >
      <Icon type="arrow-bar-up" />
      Move up
    </Button>
  {/snippet}
</Modal>

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
