<script lang="ts">
  import Button from "$src/lib/Button.svelte";
  import Icon from "$src/lib/Icon.svelte";

  import { darkMode } from "./dark-mode";

  export let data;

  async function logout() {
    await fetch("/api/auth/session", {
      method: "DELETE",
    });
  }
</script>

<div class="container">
  <header>
    <Button on:click={logout}>Logout</Button>
    <nav>
      <a href="/playlists">Playlists</a>
      {#if data.dbUser?.admin}
        |
        <a href="/random-responses">Random responses</a>
      {/if}
    </nav>
    <button class="theme-button" on:click={() => ($darkMode = !$darkMode)}>
      <Icon type={$darkMode ? "moon" : "sun"} />
    </button>
  </header>
  <main>
    <div class="content">
      <slot />
    </div>
  </main>
</div>

<style>
  .container {
    display: grid;
    grid-template: 60px calc(100vh - 60px) / 1fr;
  }
  header {
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    align-items: center;
    gap: 12px;
    background-color: var(--secondary);
    height: 60px;
    padding: 0 20px 0 15px;
  }
  .theme-button {
    border: 0;
    outline: none;
    background: none;
    cursor: pointer;
  }
  main {
    overflow-y: auto;
  }
  .content {
    margin: 0 auto;
    max-width: 1000px;
    padding: 20px 15px 100px 15px;
    overflow: auto;
  }
</style>
