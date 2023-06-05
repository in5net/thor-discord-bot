import { getVoice } from "../../music/voice-manager";
import command from "$services/commands/slash";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Add song filters",
		options: {
			filter: {
				type: "string",
				desc: "The filter to apply",
				async autocomplete(search) {
					const results = await prisma.audioFilter.findMany({
						select: {
							name: true,
						},
						where: {
							name: {
								contains: search,
							},
						},
						orderBy: {
							name: "asc",
						},
						take: 5,
					});
					return results.map(({ name }) => name);
				},
			},
		},
	},
	async (i, { filter }) => {
		const { guildId } = i;
		if (!guildId) return;
		const voice = getVoice(guildId);

		const audioFilter = await prisma.audioFilter.findFirst({
			select: {
				value: true,
			},
			where: {
				name: filter,
			},
		});
		if (!audioFilter) return i.reply(`Filter \`${filter}\` not found`);

		await voice.setFilters([audioFilter.value]);
		return i.reply(`🎚️ Set filters to \`${filter}\``);
	}
);
