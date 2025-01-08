<script lang="ts">
  import Playlist from "../Playlist.svelte";

  export let data;
  const { playlistId, name, songs } = data;
</script>

<Playlist id={playlistId} {name} {songs} />
