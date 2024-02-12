import { cache } from "$services/prisma";
import command from "discord/commands/text";

export default command(
	{
		desc: "Add an item to the stack",
		args: {
			value: {
				type: "text",
				desc: "The item to push",
			},
		},
		examples: ["hi there", "secret message"],
	},
	async ({ args: { value } }) => {
		await cache.stackItem.create({
			data: {
				value,
			},
		});
		const count = await cache.stackItem.count();
		return `Item pushed! New length: ${count}`;
	},
);
