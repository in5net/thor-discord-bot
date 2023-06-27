import { env } from "node:process";
import { Storage } from "@google-cloud/storage";
import { z } from "zod";
import { config } from "dotenv";
import serviceAccount from "./service_account.json";

config({ path: new URL(".env", import.meta.url) });

export const credentials = serviceAccount;

const storage = new Storage({ credentials });
export default storage;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof EnvironmentVariables> {}
	}
}

const EnvironmentVariables = z.object({
	FILES_DOMAIN: z.string(),
});

EnvironmentVariables.parse(env);

export const filesBucket = storage.bucket(env.FILES_DOMAIN);
