import { type Message } from "discord.js";
import command from "$services/commands/text";
import { chat, filter } from "$services/openai";
import { cache } from "$services/prisma";

export default command(
	{
		desc: "Talk to ChatGPT",
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
		const { channel, author } = message;

		if (prompt === "CLEAR") {
			await cache.context.deleteMany({
				where: {
					channelId,
				},
			});
			return message.reply("Context cleared");
		}

		if (prompt.length > 256) return message.reply("Your text is too long");
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
			take: 5,
		});

		let reply = "";
		const emitter = await chat(prompt, previous, author.id);
		let responseMessage: Message | undefined;
		let timeout: NodeJS.Timeout | undefined = setTimeout(
			() => (timeout = undefined),
			500
		);
		await new Promise<void>(resolve =>
			emitter
				.on("data", async answer => {
					reply = answer;
					if (timeout === undefined) {
						timeout = setTimeout(() => (timeout = undefined), 1000);
						if (reply) {
							if (responseMessage) await responseMessage.edit(reply);
							else responseMessage = await channel.send(reply);
						}
					}
				})
				.once("done", async () => {
					if (timeout !== undefined) clearTimeout(timeout);
					if (reply) {
						if (responseMessage) await responseMessage.edit(reply);
						else responseMessage = await channel.send(reply);
					}

					resolve();
				})
		);

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
	}
);
