import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const cachePath = new URL("../../cache", import.meta.url).pathname;

export async function ensureCacheSubDir(name: string) {
  const subDirPath = path.join(cachePath, name);
  if (!existsSync(subDirPath)) {
    await mkdir(subDirPath, { recursive: true });
  }
  return subDirPath;
}
