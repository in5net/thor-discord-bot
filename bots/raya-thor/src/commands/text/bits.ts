import { getBits, MAX_BITS } from "$services/ai/shared";
import db, { eq } from "database/drizzle";
import { users } from "database/drizzle/schema";
import command from "discord/commands/text";

export default command(
	{
		desc: "Get the number of Bits you have",
		args: {},
	},
	async ({ message }) => {
		const { author } = message;
		const user = await db.query.users.findFirst({
			columns: {
				admin: true,
			},
			where: eq(users.id, author.id),
		});
		if (user?.admin) return message.reply(`UNLIMITED 🔵 BITS!!!!`);
		const bits = await getBits(author.id);
		return message.reply(
			`You have ${bits}/${MAX_BITS} ${
				bits < 6 ? "🔴" : bits < MAX_BITS ? "🟢" : "🔵"
			} bits.${bits ? "" : " no bits?"}`,
		);
	},
);
