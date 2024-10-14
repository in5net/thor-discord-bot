export function formatTime(sec: number): string {
  if (Number.isNaN(sec)) return "unknown";
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);

  const secondsStr = seconds.toString().padStart(2, "0");
  if (hours) {
    const minutesStr = minutes.toString().padStart(2, "0");
    return `${hours}:${minutesStr}:${secondsStr}`;
  }

  return `${minutes}:${secondsStr}`;
}

export function parseTime(str: string): number {
  const parts = str.split(":").map(x => Number.parseInt(x));
  switch (parts.length) {
    case 1: {
      const [seconds] = parts;
      if (seconds === undefined || Number.isNaN(seconds))
        throw new Error("Invalid time");
      return seconds;
    }

    case 2: {
      const [minutes, seconds] = parts;
      if (minutes === undefined || Number.isNaN(minutes))
        throw new Error("Invalid minutes");
      if (seconds === undefined || Number.isNaN(seconds))
        throw new Error("Invalid seconds");
      return minutes * 60 + seconds;
    }

    case 3: {
      const [hours, minutes, seconds] = parts;
      if (hours === undefined || Number.isNaN(hours))
        throw new Error("Invalid hours");
      if (minutes === undefined || Number.isNaN(minutes))
        throw new Error("Invalid minutes");
      if (seconds === undefined || Number.isNaN(seconds))
        throw new Error("Invalid seconds");
      return hours * 3600 + minutes * 60 + seconds;
    }

    default: {
      throw new Error("Invalid time");
    }
  }
}
