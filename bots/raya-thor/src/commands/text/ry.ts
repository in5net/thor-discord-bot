import { filter, openai } from "$services/openai";
import { cache } from "$services/prisma";
import { ttlCache } from "@in5net/std/fn";
import command from "discord/commands/text";
import ms from "ms";
import { readFile } from "node:fs/promises";
import { env } from "node:process";

const gpt3DescPath = new URL("../../../gpt3-desc.txt", import.meta.url);
const desc = ttlCache(async () => readFile(gpt3DescPath, "utf8"), ms("10 min"));

export default command(
	{
		desc: "Talk to GPT-3.5",
		optionalPrefix: true,
		args: {
			prompt: {
				type: "text",
				desc: "The prompt to send",
			},
		},
	},
	async ({ message, args: { prompt } }) => {
		const channelId = BigInt(message.channelId);
		const { author } = message;

		if (prompt === "CLEAR") {
			await cache.context.deleteMany({
				where: {
					channelId,
				},
			});
			return message.reply("Context cleared");
		}

		if (prompt.length > 512) return message.reply("Your text is too long");
		if (!(await filter(prompt)))
			return message.reply("Your text did not pass the content filter");

		const minCreatedAt = new Date();
		minCreatedAt.setMinutes(minCreatedAt.getMinutes() - 5);
		const previous = await cache.context.findMany({
			select: {
				question: true,
				answer: true,
			},
			where: {
				createdAt: {
					gte: minCreatedAt,
				},
				channelId: BigInt(message.channelId),
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 10,
		});

		const response = await openai.completions.create({
			model: "gpt-3.5-turbo-instruct",
			prompt: `${await desc()} Current time: ${new Date().toLocaleString()}

${previous.map(
	({ question: q, answer: a }) => `You: ${q}
${env.NAME}: ${a}
`,
)}
You: ${prompt}
${env.NAME}:`,
			temperature: 0.9,
			max_tokens: 1024,
			frequency_penalty: 0.5,
			presence_penalty: 0.5,
			stop: ["You:"],
			user: author.id,
		});
		const reply = response.choices?.[0]?.text || "";
		await message.channel.send(reply);

		return cache.context.create({
			data: {
				channel: {
					connectOrCreate: {
						create: {
							id: channelId,
						},
						where: {
							id: channelId,
						},
					},
				},
				question: prompt,
				answer: reply,
			},
		});
	},
);
