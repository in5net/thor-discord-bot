<script lang="ts">
  export let data;

  async function logout() {
    await fetch("/api/auth/session", {
      method: "DELETE",
    });
  }
</script>

<nav>
  <button on:click={logout}>Logout</button>
  <a href="/playlists">Playlists</a>
  {#if data.dbUser?.admin}
    <a href="/random-responses">Random responses</a>
  {/if}
</nav>

<slot />
