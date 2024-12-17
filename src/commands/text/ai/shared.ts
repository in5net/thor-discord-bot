import { ttlCache } from "@iz7n/std/fn";
import ms from "ms";
import { readFile } from "node:fs/promises";

const systemPath = new URL(
  "../../../../uncensored-system.txt",
  import.meta.url,
);
export const system = ttlCache(
  async () => readFile(systemPath, "utf8"),
  ms("10 min"),
);

const uncensoredSystemPath = new URL(
  "../../../../uncensored-system.txt",
  import.meta.url,
);
export const uncensoredSystem = ttlCache(
  async () => readFile(uncensoredSystemPath, "utf8"),
  ms("10 min"),
);

const descPath = new URL("../../../../chatgpt-desc.txt", import.meta.url);
export const description = ttlCache(
  async () => readFile(descPath, "utf8"),
  ms("10 min"),
);
