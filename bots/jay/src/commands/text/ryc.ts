import command from "$services/commands/text";
import { cache } from "$services/prisma";

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
	}
);
