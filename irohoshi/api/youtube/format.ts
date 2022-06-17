export function formatDuration(sec: number): string {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const secondsStr = seconds.toString().padStart(2, '0');
  if (hours) {
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours}:${minutesStr}:${secondsStr}`;
  }
  return `${minutes}:${secondsStr}`;
}
