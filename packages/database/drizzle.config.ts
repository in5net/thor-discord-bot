import type { Config } from "drizzle-kit";
import { env } from "node:process";

export default {
	schema: "./drizzle/schema.ts",
	out: "./drizzle",
	driver: "mysql2",
	dbCredentials: {
		connectionString: env.DATABASE_URL.replace(
			"sslaccept=strict",
			'ssl={"rejectUnauthorized":true}',
		),
	},
} satisfies Config;
