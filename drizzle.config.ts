import { defineConfig } from "drizzle-kit";
import { env } from "node:process";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/database/drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
});
