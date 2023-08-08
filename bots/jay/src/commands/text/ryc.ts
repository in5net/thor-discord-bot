import { cache } from "$services/prisma";
import command from "discord/commands/text";

export default command(
	{
		desc: "Clear the messages in the context",
		optionalPrefix: true,
		args: {},
	},
	async ({ message }) => {
		await cache.context.deleteMany({
			where: {
				channelId: BigInt(message.channelId),
			},
		});
		await message.reply("Context cleared");
	},
);
