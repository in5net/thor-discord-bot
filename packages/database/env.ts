import { env } from "node:process";
import { z } from "zod";
import { config } from "dotenv";

config({ path: new URL(".env", import.meta.url) });

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
});

const result = EnvironmentVariables.safeParse(env);
if (result.success) console.log("✅ Environment variables verified");
else throw new Error(`❌ Environment variables not verified: ${result.error}`);
