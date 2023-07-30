import command from "discord/commands/slash";
import db, { eq, icontains } from "database/drizzle";
import { audioFilters } from "database/drizzle/schema";
import { getVoice } from "$src/music/voice-manager";

export default command(
	{
		desc: "Add song filters",
		options: {
			filter: {
				type: "string",
				desc: "The filter to apply",
				async autocomplete(search) {
					const results = await db.query.audioFilters.findMany({
						columns: {
							name: true,
						},
						where: icontains(audioFilters.name, search),
						orderBy: audioFilters.name,
						limit: 5,
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

		const audioFilter = await db.query.audioFilters.findFirst({
			columns: {
				value: true,
			},
			where: eq(audioFilters.name, filter),
		});
		if (!audioFilter) return i.reply(`Filter \`${filter}\` not found`);

		await voice.setFilters([audioFilter.value]);
		return i.reply(`🎚️ Set filters to \`${filter}\``);
	},
);
