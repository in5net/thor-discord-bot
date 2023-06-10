import { readFile } from "node:fs/promises";
import { env } from "node:process";
import { TextServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";

const { NAME, MAKERSUITE_API_KEY } = env;

const client = new TextServiceClient({
	authClient: new GoogleAuth().fromAPIKey(MAKERSUITE_API_KEY),
});

const palmDescPath = new URL("../../../palm-desc.txt", import.meta.url);

export async function answer(
	question: string,
	previous: Array<{ question: string; answer: string }>
) {
	const desc = await readFile(palmDescPath, "utf8");
	const result = await client.generateText({
		model: "models/text-bison-001",
		prompt: {
			text: `${desc} Current date: ${new Date().toDateString()}
${previous.map(
	({ question: q, answer: a }) => `You: ${q}
${NAME}: ${a}`
)}
You: ${question}
${NAME}:`,
		},
		stopSequences: ["You:"],
	});
	return result[0].candidates?.[0]?.output || "";
}
