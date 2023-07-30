import command from "discord/commands/slash";
import db from "database/drizzle";

export default command(
	{
		desc: "See all filters",
		options: {},
	},
	async i => {
		const filters = await db.query.audioFilters.findMany({
			columns: {
				name: true,
			},
		});
		return i.reply(
			`Filters: ${filters.map(({ name }) => `\`${name}\``).join(", ")}`,
		);
	},
);
