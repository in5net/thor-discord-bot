import { env } from "node:process";
import type { Config } from "drizzle-kit";

export default {
	out: "./drizzle",
	driver: "mysql2",
	dbCredentials: {
		connectionString: env.DATABASE_URL.replace(
			"sslaccept=strict",
			'ssl={"rejectUnauthorized":true}'
		),
	},
} satisfies Config;
