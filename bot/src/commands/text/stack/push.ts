import db, { count } from "database/drizzle";
import { stackItems } from "database/drizzle/schema";
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
		await db.insert(stackItems).values({
			value,
		});
		const [result] = await db.select({ count: count() }).from(stackItems);
		return `Item pushed! New length: ${result?.count || 0}`;
	},
);
