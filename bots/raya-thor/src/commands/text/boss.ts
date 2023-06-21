import command from "discord/commands/text";
import db, { sql } from "database/drizzle";

export default command(
	{
		desc: "Get a random video of boss",
		args: {},
	},
	async ({ message }) => {
		const boss = await db.query.bossFiles.findFirst({
			columns: {
				url: true,
			},
			orderBy: sql`rand()`,
		});
		if (!boss) return message.reply("No boss found");
		return message.reply(boss.url);
	}
);
