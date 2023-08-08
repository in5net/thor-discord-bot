import { answer } from "$services/palm";
import { cache } from "$services/prisma";
import command from "discord/commands/text";

export default command(
	{
		desc: "Talk to PaLM",
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

		if (prompt === "CLEAR") {
			await cache.context.deleteMany({
				where: {
					channelId,
				},
			});
			return message.reply("Context cleared");
		}

		if (prompt.length > 256) return message.reply("Your text is too long");

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

		const reply = await answer(prompt, previous);
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
