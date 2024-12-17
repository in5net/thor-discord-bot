import { createOpenAI } from "@ai-sdk/openai";
import { ttlCache } from "@iz7n/std/fn";
import ms from "ms";
import { readFile } from "node:fs/promises";

const relativeRootPath = "../../../..";

const systemPath = new URL(
  `${relativeRootPath}/chat-system.txt`,
  import.meta.url,
);
export const system = ttlCache(
  async () => readFile(systemPath, "utf8"),
  ms("10 min"),
);

const descPath = new URL(`${relativeRootPath}/chat-desc.txt`, import.meta.url);
export const description = ttlCache(
  async () => readFile(descPath, "utf8"),
  ms("10 min"),
);

export const openai = createOpenAI({
  baseURL: "http://localhost:1277/v1",
  compatibility: "compatible",
});
