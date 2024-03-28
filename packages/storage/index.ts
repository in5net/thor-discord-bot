import { Storage } from "@google-cloud/storage";
import { env } from "node:process";
import { z } from "zod";
import serviceAccount from "./service_account.json";

export const credentials = serviceAccount;

const storage = new Storage({ credentials });
export default storage;

declare global {
	// eslint-disable-next-line ts/no-namespace
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof EnvironmentVariables> {}
	}
}

const EnvironmentVariables = z.object({
	FILES_DOMAIN: z.string(),
});

EnvironmentVariables.parse(env);

export const filesBucket = storage.bucket(env.FILES_DOMAIN);
