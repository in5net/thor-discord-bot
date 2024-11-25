import { glob } from "node:fs/promises";

export const noTestGlob = (pattern: string) =>
  glob(pattern, {
    exclude: path => path.endsWith(".test.ts"),
  });
