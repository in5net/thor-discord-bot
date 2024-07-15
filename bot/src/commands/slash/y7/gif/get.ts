import db, { ne, sql } from "database/drizzle";
import command from "discord/commands/slash";
import { env } from "node:process";
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
			orderBy: sql`random()`,
		});
		if (!gif) return i.reply("No image found");

		const url = `https://${env.FILES_DOMAIN}/y7/images/${gif.name}`;
		return i.reply(url);
	},
);
