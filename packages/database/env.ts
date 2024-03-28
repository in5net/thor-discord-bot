import { env } from "node:process";
import { z } from "zod";

declare global {
	// eslint-disable-next-line ts/no-namespace
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof EnvironmentVariables> {}
	}
}

const EnvironmentVariables = z.object({
	DATABASE_URL: z.string(),
});

EnvironmentVariables.parse(env);
