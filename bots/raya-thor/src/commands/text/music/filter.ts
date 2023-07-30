import db, { inArray } from "database/drizzle";
import { audioFilters } from "database/drizzle/schema";
import musicCommand from "./command";

export default musicCommand(
	{
		aliases: ["f", "philter", "ph"],
		desc: "Add song filters",
		args: {
			filters: {
				type: "words",
				desc: "The filter to apply",
				optional: true,
			},
		},
		permissions: ["vc"],
	},
	async ({ message, args: { filters }, voice }) => {
		voice.setChannels(message);

		if (!filters?.length) {
			await voice.setFilters();
			return voice.send("🎚️ Filters cleared");
		}

		const results = await db.query.audioFilters.findMany({
			where: inArray(audioFilters.name, filters),
		});
		if (results.length !== filters.length)
			return message.reply(
				`Filters not found: ${filters
					.filter(filter => !results.some(af => af.name === filter))
					.map(filter => `\`${filter}\``)
					.join(", ")}`,
			);

		await voice.setFilters(results.map(f => f.value));
		return voice.send(
			`🎚️ Filters set to ${results
				.map(({ name }) => `\`${name}\``)
				.join(", ")}`,
		);
	},
);
