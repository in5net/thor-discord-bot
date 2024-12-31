<script lang="ts">
  const { data } = $props();
  const { playlists } = data;
</script>

<h3>Playlists</h3>
<ul>
  {#each playlists as { id, name }}
    <li><a href="./{id}">{name}</a></li>
  {/each}
</ul>
