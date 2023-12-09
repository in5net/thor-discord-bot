import { defineConfig } from "drizzle-kit";
import { env } from "node:process";

export default defineConfig({
	schema: "./drizzle/schema.ts",
	out: "./drizzle",
	driver: "mysql2",
	dbCredentials: {
		uri: env.DATABASE_URL.replace(
			"sslaccept=strict",
			'ssl={"rejectUnauthorized":true}',
		),
	},
	verbose: true,
	strict: true,
});
