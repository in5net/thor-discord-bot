import logger from "$lib/logger";
import "dotenv/config";
import { env } from "node:process";
import { z } from "zod";

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvironmentVariables> {
      COLOR: `#${string}`;
    }
  }
}

const EnvironmentVariables = z.object({
  FILES_PATH: z.string(),
  FILES_DOMAIN: z.string(),

  NODE_ENV: z.enum(["development", "production"]),
  NAME: z.string(),
  PREFIX: z.string(),
  COLOR: z.string().startsWith("#"),
  PORT: z.coerce.number(),

  DISCORD_ID: z.string(),
  DISCORD_TOKEN: z.string(),

  OWNER_ID: z.string(),
  GUILD_ID: z.string(),

  WEBHOOK_URL: z.string(),

  GOOGLE_APIS_KEY: z.string(),
  CUSTOM_SEARCH_ID: z.string(),

  GENIUS_TOKEN: z.string(),

  REPLICATE_TOKEN: z.string(),
  DEEPL_API_KEY: z.string(),
});

const result = EnvironmentVariables.safeParse(env);
if (result.success) {
  logger.debug("✅ Environment variables verified");
} else {
  throw new Error("❌ Environment variables not verified:", result.error);
}
