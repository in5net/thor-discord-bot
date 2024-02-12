import { cache } from "$lib/prisma";
import { time } from "discord.js";
import command from "discord/commands/text";

export default command(
	{
		desc: "Removes the last an item from the stack",
		args: {},
	},
	async () => {
		const item = await cache.stackItem.findFirst({
			select: {
				id: true,
				createdAt: true,
				value: true,
			},
			orderBy: {
				id: "desc",
			},
		});
		if (!item) return "Nothing was popped since the stack is empty";
		await cache.stackItem.delete({
			where: {
				id: item.id,
			},
		});
		const count = await cache.stackItem.count();
		return `Item popped! New length: ${count}
Pushed at: ${time(item.createdAt)}
Value: ${item.value}`;
	},
);
