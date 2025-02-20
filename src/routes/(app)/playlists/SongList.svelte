<script lang="ts">
  import Button from "$src/lib/Button.svelte";
  import Icon from "$src/lib/Icon.svelte";
  import Item from "$src/lib/list/Item.svelte";
  import List from "$src/lib/list/List.svelte";

  import { formatTime } from "$lib/time";
  import type { PlaylistItemJSON } from "$src/music/songs";
  import { sum } from "@in5net/std/stats";
  import { quantify } from "@in5net/std/string";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  interface Props {
    title?: string;
    items: { id: string; item: PlaylistItemJSON }[];
    selected: string[];
    onclick?: (item: PlaylistItemJSON) => any;
  }
  let {
    title,
    items = $bindable(),
    selected = $bindable(),
    onclick = () => {},
  }: Props = $props();

  const flipDurationMs = 300;
  function handleDndCards(e: CustomEvent<{ items: typeof items }>) {
    ({ items } = e.detail);
  }
</script>

<List {title}>
  <div
    onconsider={handleDndCards}
    onfinalize={handleDndCards}
    use:dndzone={{ items, flipDurationMs }}
  >
    {#each items as { id, item }, i (id)}
      {@const checked = selected.includes(id)}
      {@const oncheck = () => {
        if (selected.includes(id)) {
          selected = selected.filter(x => x !== id);
        } else {
          selected.push(id);
        }
      }}
      <div animate:flip={{ duration: flipDurationMs }}>
        {#if item.type === "playlist"}
          <Item
            description="{quantify('song', item.songs.length)}・{formatTime(
              sum(item.songs.map(x => x.duration)),
            )}"
            icon="playlist"
            label="{i + 1}. YOUTUBE PLAYLIST: {item.name}"
          >
            <Button onclick={() => onclick(item)}>
              <Icon type="modal" />
              View songs
            </Button>
            <Button
              onclick={() =>
                window.open(
                  `https://youtube.com/playlist?list=${item.id}`,
                  "_blank",
                )}
            >
              <Icon type="external-link" />
            </Button>
            <Button onclick={() => (items = items.filter(x => x.id !== id))}>
              <Icon type="x" />
            </Button>
          </Item>
        {:else if item.type === "group"}
          <Item
            description="{quantify('song', item.songs.length)}・{formatTime(
              sum(item.songs.map(x => x.duration)),
            )}"
            icon="playlist"
            label="{i + 1}. GROUP: {item.name}"
          >
            <Button onclick={() => onclick(item)}>
              <Icon type="modal" />
              View songs
            </Button>
            <Button onclick={() => (items = items.filter(x => x.id !== id))}>
              <Icon type="x" />
            </Button>
          </Item>
        {:else}
          <Item
            {checked}
            description={formatTime(item.duration)}
            icon="music"
            label="{i + 1}. {item.title}"
            onclick={oncheck}
          >
            {#if item.type === "youtube"}
              <Button
                onclick={() =>
                  window.open(`https://youtu.be/${item.id}`, "_blank")}
              >
                <Icon type="external-link" />
              </Button>
            {/if}
            <Button onclick={() => (items = items.filter(x => x.id !== id))}>
              <Icon type="x" />
            </Button>
          </Item>
        {/if}
      </div>
    {/each}
  </div>
</List>
