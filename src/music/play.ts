export async function getPlayDl(refresh = false) {
  const { default: play } = await import("play-dl");
  if (refresh && play.is_expired()) {
    await play.refreshToken();
  }
  return play;
}
