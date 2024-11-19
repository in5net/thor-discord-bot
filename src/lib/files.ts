import { createId } from "@paralleldrive/cuid2";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { env } from "node:process";

export async function prepareTaggedFile(name: string) {
  const id = createId();
  const dirSubPath = `tagged/${id}`;
  const dirPath = path.join(env.FILES_PATH, dirSubPath);
  const subPath = `${dirPath}/${name}`;
  const filePath = path.join(env.FILES_PATH, subPath);
  await mkdir(dirPath);

  return {
    id,
    path: filePath,
    ext: path.parse(filePath).ext,
    url: `https://${env.FILES_DOMAIN}/${subPath}`,
  };
}

export function getFileUrl({ id, name }: { id: string; name: string }) {
  return `https://${env.FILES_DOMAIN}/tagged/${id}/${name}`;
}
