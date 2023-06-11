import { readFile } from "node:fs/promises";
import { env } from "node:process";
import { type Buffer } from "node:buffer";
import { createRegExp, exactly } from "magic-regexp";
import { Configuration, OpenAIApi } from "openai";
import { TypedEmitter } from "tiny-typed-emitter";

const { NAME, OPENAI_API_KEY } = env;

export const openai = new OpenAIApi(
	new Configuration({
		apiKey: OPENAI_API_KEY,
	})
);

export async function filter(input: string): Promise<boolean> {
	const {
		data: {
			results: [result],
		},
	} = await openai.createModeration({ input });
	return !result?.flagged;
}

const gpt3DescPath = new URL("../../gpt3-desc.txt", import.meta.url);

export async function answer(
	question: string,
	previous: Array<{ question: string; answer: string }>,
	user?: string
): Promise<string> {
	const desc = await readFile(gpt3DescPath, "utf8");
	const response = await openai.createCompletion({
		model: "text-curie-001",
		prompt: `${desc} Current date: ${new Date().toDateString()}

${previous.map(
	({ question: q, answer: a }) => `You: ${q}
${NAME}: ${a}
`
)}
You: ${question}
${NAME}:`,
		temperature: 0.9,
		max_tokens: 512,
		frequency_penalty: 0.5,
		presence_penalty: 0.5,
		stop: ["You:"],
		user,
	});
	return response.data.choices?.[0]?.text || "";
}

const chatGPTSystemPath = new URL("../../chatgpt-system.txt", import.meta.url);
const chatGPTDescPath = new URL("../../chatgpt-desc.txt", import.meta.url);

export async function chat(
	question: string,
	previous: Array<{ question: string; answer: string }>,
	user?: string
) {
	const system = await readFile(chatGPTSystemPath, "utf8");
	const desc = await readFile(chatGPTDescPath, "utf8");
	const response = await openai.createChatCompletion(
		{
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content: `${system} Current date: ${new Date().toDateString()}`,
				},
				{
					role: "assistant",
					content: desc,
				},
				...previous.flatMap(
					({ question: q, answer: a }) =>
						[
							{ role: "user", content: q },
							{ role: "assistant", content: a },
						] as const
				),
				{ role: "user", content: question },
			],
			max_tokens: 512,
			stream: true,
			user,
		},
		{ responseType: "stream" }
	);

	const emitter = new TypedEmitter<{
		data: (response: string) => void;
		done: () => void;
	}>();

	let reply = "";
	response.data.on("data", (data: Buffer) => {
		const lines = data
			.toString()
			.split("\n")
			.filter(line => line.trim());
		for (const line of lines) {
			const message = line.replace(
				createRegExp(exactly("data: ").at.lineStart()),
				""
			);
			if (message === "[DONE]") return emitter.emit("done");

			const parsed = JSON.parse(message);
			const next = (parsed.choices[0].delta.content as string) || "";
			reply += next;
			emitter.emit("data", reply);
		}
	});
	return emitter;
}
