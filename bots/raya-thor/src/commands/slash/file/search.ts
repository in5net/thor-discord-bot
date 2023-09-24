import { eq, icontains, neon } from "database/drizzle";
import { attachments } from "database/drizzle/neon";
import command from "discord/commands/slash";
import { sendFile } from "./shared";

export default command(
	{
		desc: "Search for a file",
		options: {
			file: {
				type: "string",
				desc: "The file name to search for",
				async autocomplete(search) {
					const results = await neon.query.attachments.findMany({
						columns: {
							id: true,
							filename: true,
						},
						where: icontains(attachments.filename, search),
						orderBy: attachments.filename,
						limit: 5,
					});
					return Object.fromEntries(
						results.map(({ id, filename }) => [id.toString(), filename]),
					);
				},
			},
		},
	},
	async (i, { file }) => {
		const fileData = await neon.query.attachments.findFirst({
			where: eq(attachments.id, BigInt(file)),
		});
		if (!fileData) return i.reply("No file found");
		return sendFile(i, fileData);
	},
);
