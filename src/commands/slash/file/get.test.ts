import assert from "node:assert";
import test from "node:test";
import { getRandomFile } from "./shared";

await test("get random file", async () => {
  const file1 = await getRandomFile();
  const file2 = await getRandomFile();
  assert(file1?.id !== file2?.id);
  console.log(file1?.filename, file2?.filename);
});

await test("get random image", async () => {
  const file1 = await getRandomFile("image");
  const file2 = await getRandomFile("image");
  assert(file1?.id !== file2?.id);
  console.log(file1?.filename, file2?.filename);
});

await test("get random video", async () => {
  const file1 = await getRandomFile("video");
  const file2 = await getRandomFile("video");
  assert(file1?.id !== file2?.id);
  console.log(file1?.filename, file2?.filename);
});

await test("get random audio", async () => {
  const file1 = await getRandomFile("audio");
  const file2 = await getRandomFile("audio");
  assert(file1?.id !== file2?.id);
  console.log(file1?.filename, file2?.filename);
});
