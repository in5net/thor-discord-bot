import command from "discord/commands/slash";
import prisma from "$services/prisma";

export default command(
	{
		desc: "See all filters",
		options: {},
	},
	async i => {
		const filters = await prisma.audioFilter.findMany({
			select: {
				name: true,
			},
		});
		return i.reply(
			`Filters: ${filters.map(({ name }) => `\`${name}\``).join(", ")}`,
		);
	},
);
