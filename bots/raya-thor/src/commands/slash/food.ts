import { env } from "node:process";
import command from "discord/commands/slash";
import db, { sql } from "database/drizzle";

export default command(
	{
		desc: "Get a random gif from yyyyyyy.info",
		options: {},
	},
	async i => {
		const food = await db.query.rotatingFood.findFirst({
			columns: {
				name: true,
			},
			orderBy: sql`rand()`,
		});
		if (!food) return i.reply("No food found");

		const url = `https://${env.FILES_DOMAIN}/rotatingfood5/${encodeURIComponent(
			food.name
		)}`;
		return i.reply(url);
	}
);
