<script lang="ts">
  export let data;
  const { playlists } = data;
</script>

<h3>Playlists</h3>
<ul>
  {#each playlists as { id, name }}
    <li><a href="/playlists/{id}">{name}</a></li>
  {/each}
</ul>
