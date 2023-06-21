import { env } from "node:process";
import { z } from "zod";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof EnvironmentVariables> {
			COLOR: `#${string}`;
		}
	}
}

const EnvironmentVariables = z.object({
	DATABASE_URL: z.string(),
});

const result = EnvironmentVariables.safeParse(env);
if (result.success) console.log("✅ Environment variables verified");
else throw new Error(`❌ Environment variables not verified: ${result.error}`);
