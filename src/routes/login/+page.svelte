<script lang="ts">
  import { page } from "$app/stores";

  const { data } = $props();
  const { DISCORD_ID } = data;

  const { url } = $page;
</script>

<a
  href="https://discord.com/oauth2/authorize?{new URLSearchParams({
    client_id: DISCORD_ID,
    redirect_uri: `${url.origin}/api/auth/session`,
    response_type: 'code',
    scope: 'identify',
  })}"
>
  Login
</a>
