import db, { sql } from "database/drizzle";
import command from "discord/commands/text";
import { env } from "node:process";

export default command(
	{
		desc: "Get a random gif of rotating food",
		args: {},
	},
	async ({ message }) => {
		const food = await db.query.rotatingFood.findFirst({
			columns: {
				name: true,
			},
			orderBy: sql`rand()`,
		});
		if (!food) return message.reply("No food found");

		const url = `https://${env.FILES_DOMAIN}/rotatingfood5/${encodeURIComponent(
			food.name,
		)}`;
		return message.reply(url);
	},
);
