<script lang="ts">
  const { children } = $props();

  async function logout() {
    await fetch("/api/auth/session", {
      method: "DELETE",
    });
  }
</script>

<button onclick={logout}>Logout</button>

{@render children()}
