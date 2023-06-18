import { readFile } from "node:fs/promises";
import { env } from "node:process";
import {
	Configuration,
	OpenAIApi,
	type ResponseTypes,
} from "@nick.heiner/openai-edge";
import { TypedEmitter } from "tiny-typed-emitter";
import { OpenAIStream as openAIStream } from "ai";

const { NAME, OPENAI_API_KEY } = env;

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
	const data = (await response.json()) as ResponseTypes["createCompletion"];
	return data.choices?.[0]?.text || "";
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
	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		stream: true,
		max_tokens: 512,
		user,
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
	});

	const emitter = new TypedEmitter<{
		data: (response: string) => void;
		done: () => void;
	}>();

	let reply = "";
	openAIStream(response, {
		async onToken(token) {
			reply += token;
			emitter.emit("data", reply);
		},
		async onCompletion() {
			emitter.emit("done");
		},
	});

	return emitter;
}
