import { env } from "node:process";
import command from "discord/commands/slash";
import db, { sql } from "database/drizzle";

export default command(
	{
		desc: "Sends a speech bubble",
		options: {},
	},
	async i => {
		await i.deferReply();
		await i.deleteReply();
		const bubble = await db.query.speechBubbles.findFirst({
			columns: {
				name: true,
			},
			orderBy: sql`rand()`,
		});
		await i.channel?.send(
			`https://${env.FILES_DOMAIN}/speech-bubbles/${bubble?.name}`
		);
	}
);
