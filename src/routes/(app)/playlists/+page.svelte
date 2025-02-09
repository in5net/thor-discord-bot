<script lang="ts">
  import Item from "$src/lib/list/Item.svelte";
  import List from "$src/lib/list/List.svelte";

  import { goto } from "$app/navigation";
  import { quantify } from "@in5net/std/string";

  const { data } = $props();
  const { playlists } = data;
</script>

<a href="/playlists/add">Add</a>

<List title="Playlists">
  {#each playlists as { id, name, songs }}
    <Item
      description={quantify("song", songs)}
      label={name}
      onclick={() => goto(`/playlists/${id}`)}
    />
  {/each}
</List>
