import { env } from "node:process";
import command from "discord/commands/slash";
import db, { sql, ne } from "database/drizzle";
import { NSFW_FILE_NAME } from "./shared";

export default command(
	{
		desc: "Get a random gif from yyyyyyy.info",
		options: {},
	},
	async i => {
		const gif = await db.query.y7Files.findFirst({
			columns: {
				name: true,
			},
			where: (table, { and, eq }) =>
				and(ne(table.name, NSFW_FILE_NAME), eq(table.extension, "gif")),
			orderBy: sql`rand()`,
		});
		if (!gif) return i.reply("No image found");

		const url = `https://${env.FILES_DOMAIN}/y7/images/${gif.name}`;
		return i.reply(url);
	}
);
