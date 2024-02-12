import db from "database/drizzle";
import { ratios } from "database/drizzle/schema";
import command from "discord/commands/slash";

export default command(
	{
		desc: "Adds some ratios to the list",
		options: {
			ratios: {
				type: "string",
				desc: "The ratios to add ('+' separated)",
			},
		},
	},
	async (i, { ratios: r }) => {
		await i.deferReply();
		const ratioStrs = r
			.split("+")
			.map(s => s.trim())
			.filter(Boolean);
		await db.insert(ratios).values(ratioStrs.map(s => ({ content: s })));
		return i.editReply("Added to ratios");
	},
);
