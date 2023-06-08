import command from "discord/commands/text";
import { answer, filter } from "$services/openai";
import { cache } from "$services/prisma";

export default command(
	{
		desc: "Talk to GPT-3",
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

		const reply = await answer(prompt, previous, author.id);
		await channel.send(reply);

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
