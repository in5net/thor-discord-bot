import { defineConfig } from "drizzle-kit";
import { env } from "node:process";

export default defineConfig({
	schema: "./drizzle/schema.ts",
	out: "./drizzle",
	driver: "pg",
	dbCredentials: {
		connectionString: env.DATABASE_URL,
	},
	verbose: true,
	strict: true,
});
