<script lang="ts">
  const { data } = $props();
  const { user } = data;
</script>

<h1>Welcome to the THOR DASHBOARD</h1>
<p>Uid: {user.id}, Username: {user.username}</p>
