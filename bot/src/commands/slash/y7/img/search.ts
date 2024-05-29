import { pipe } from "@in5net/std/fn";
import { collect, pick } from "@in5net/std/iter";
import db, { and, contains, ne } from "database/drizzle";
import { y7Files } from "database/drizzle/schema";
import command from "discord/commands/slash";
import { env } from "node:process";

export default command(
	{
		desc: "Search for an image from yyyyyyy.info",
		options: {
			file_name: {
				type: "string",
				desc: "The file name to search for",
				async autocomplete(search) {
					const results = await db.query.y7Files.findMany({
						columns: {
							name: true,
						},
						where: and(
							contains(y7Files.name, search),
							ne(y7Files.extension, "gif"),
						),
						orderBy: y7Files.name,
						limit: 5,
					});
					return pipe(results, pick("name"), collect);
				},
			},
		},
	},
	async (i, { file_name }) => {
		const url = `https://${env.FILES_DOMAIN}/y7/images/${file_name}`;
		return i.reply(url);
	},
);
