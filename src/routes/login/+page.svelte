<script lang="ts">
  import { page } from "$app/stores";

  export let data;
  const { DISCORD_ID } = data;

  const { url } = $page;
</script>

<a
  href="https://discord.com/oauth2/authorize?{new URLSearchParams({
    client_id: DISCORD_ID,
    redirect_uri: `${url.origin}/auth/session`,
    response_type: 'code',
    scope: 'identify',
  })}"
>
  Login
</a>
