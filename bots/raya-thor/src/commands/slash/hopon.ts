import command from "discord/commands/slash";
import db, { sql } from "database/drizzle";

export default command(
	{
		desc: "Hop on <insert thing here>",
		options: {},
	},
	async i => {
		await i.deferReply();
		await i.deleteReply();
		const hopOn = await db.query.hopOn.findFirst({
			columns: {
				id: true,
			},
			orderBy: sql`rand()`,
		});
		await i.channel?.send(`https://tenor.com/view/${hopOn?.id}`);
	},
);
