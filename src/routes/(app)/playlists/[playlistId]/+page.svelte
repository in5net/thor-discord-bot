<script lang="ts">
  import Playlist from "../Playlist.svelte";

  const { data } = $props();
  const { playlistId, name, songs } = data;
</script>

<Playlist id={playlistId} {name} {songs} />
