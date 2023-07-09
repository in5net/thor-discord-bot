import { env } from "node:process";
import {
	Configuration,
	OpenAIApi,
	type ResponseTypes,
} from "@nick.heiner/openai-edge";

const { OPENAI_API_KEY } = env;

export const openai = new OpenAIApi(
	new Configuration({
		apiKey: OPENAI_API_KEY,
	})
);

export async function filter(input: string): Promise<boolean> {
	const response = await openai.createModeration({ input });
	const data = (await response.json()) as ResponseTypes["createModeration"];
	return !data.results[0]?.flagged;
}
