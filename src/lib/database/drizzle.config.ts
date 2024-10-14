import { defineConfig } from "drizzle-kit";
import { env } from "node:process";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
