import { env } from "node:process";
import { z } from "zod";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof EnvironmentVariables> {}
	}
}

const EnvironmentVariables = z.object({
	DATABASE_URL: z.string(),
	DATABASE_HOST: z.string(),
	DATABASE_USERNAME: z.string(),
	DATABASE_PASSWORD: z.string(),
	PG_DATABASE_URL: z.string(),
});

EnvironmentVariables.parse(env);
