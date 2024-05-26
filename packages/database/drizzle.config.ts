import { defineConfig } from "drizzle-kit";
import { env } from "node:process";

export default defineConfig({
	schema: "./drizzle/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	driver: "better-sqlite",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
	verbose: true,
	strict: true,
});
