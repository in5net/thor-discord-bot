import { defineConfig } from "drizzle-kit";
import { env } from "node:process";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
});
