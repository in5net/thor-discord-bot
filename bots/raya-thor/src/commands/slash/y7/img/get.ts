import { env } from "node:process";
import command from "discord/commands/slash";
import db, { sql, ne } from "database/drizzle";

export default command(
	{
		desc: "Get a random image from yyyyyyy.info",
		options: {},
	},
	async i => {
		const image = await db.query.y7Files.findFirst({
			columns: {
				name: true,
			},
			where: table => ne(table.extension, "gif"),
			orderBy: sql`rand()`,
		});
		if (!image) return i.reply("No image found");

		const url = `https://${env.FILES_DOMAIN}/y7/images/${image.name}`;
		return i.reply(url);
	},
);
