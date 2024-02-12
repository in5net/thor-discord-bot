import { env } from "node:process";
import OpenAI from "openai";

const { OPENAI_API_KEY } = env;

export const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

export async function filter(input: string): Promise<boolean> {
	const response = await openai.moderations.create({ input });
	return !response.results[0]?.flagged;
}
