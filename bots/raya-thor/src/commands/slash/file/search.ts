import command from "discord/commands/slash";
import db, { eq, icontains } from "database/drizzle";
import { files } from "database/drizzle/schema";
import { sendFile } from "./shared";

export default command(
	{
		desc: "Search for a file",
		options: {
			file: {
				type: "string",
				desc: "The file name to search for",
				async autocomplete(search) {
					const results = await db.query.files.findMany({
						columns: {
							id: true,
							base: true,
						},
						where: icontains(files.base, search),
						orderBy: files.base,
						limit: 5,
					});
					return Object.fromEntries(
						results.map(({ id, base }) => [id.toString(), base]),
					);
				},
			},
		},
	},
	async (i, { file }) => {
		const fileData = await db.query.files.findFirst({
			where: eq(files.id, BigInt(file)),
		});
		if (!fileData) return i.reply("No file found");
		return sendFile(i, fileData);
	},
);
