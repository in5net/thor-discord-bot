import db, { sql } from "database/drizzle";
import command from "discord/commands/text";

export default command(
	{
		desc: "Hop on <insert thing here>",
		args: {},
	},
	async () => {
		const hopOn = await db.query.hopOns.findFirst({
			columns: {
				id: true,
			},
			orderBy: sql`random()`,
		});
		return `https://tenor.com/view/${hopOn?.id}`;
	},
);
