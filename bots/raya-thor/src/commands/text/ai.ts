import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { DynamicStructuredTool } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { z } from "zod";
import musicCommand from "./music/command";

export default musicCommand(
	{
		desc: "Use AI to do stuff",
		optionalPrefix: true,
		args: {
			prompt: {
				type: "text",
				desc: "The prompt to send",
			},
		},
	},
	async ({ message, voice, args: { prompt } }) => {
		if (prompt.length > 256) return message.reply("Your text is too long");

		const { channel, author } = message;
		await channel.sendTyping();

		const model = new ChatOpenAI({
			temperature: 0,
			modelKwargs: { user: author.id },
		});
		const tools = [
			new Calculator(),
			new DynamicStructuredTool({
				name: "song-player",
				description: "plays a song",
				schema: z.object({
					query: z.string().describe("A song title or a url of a song"),
				}),
				async func({ query }) {
					await voice.add(message, query);
					return `Now playing: ${query}`;
				},
			}),
		];

		const executor = await initializeAgentExecutorWithOptions(tools, model, {
			agentType: "structured-chat-zero-shot-react-description",
		});

		const { output } = (await executor.call({ input: prompt })) as {
			output: string;
		};
		return channel.send(output);
	},
);
