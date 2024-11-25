import { createHash } from "node:crypto";

const size = 16;

export function strTo16x16(input: string): boolean[][] {
  const hash = createHash("sha256");
  hash.update(input);
  const digest = hash.digest("hex");

  const grid = Array.from<boolean[]>({ length: size }).map(() =>
    Array.from<boolean>({ length: size }).fill(false),
  );

  for (const [i, char] of [...digest].entries()) {
    const byte = Number.parseInt(char, 16);
    for (let offset = 0; offset < 4; offset++) {
      const index = i * 4 + offset;
      const x = index % size;
      const y = Math.floor(index / size);
      const bit = (byte >> offset) & 1;

      grid[x]![y] = !!bit;
    }
  }

  return grid;
}
