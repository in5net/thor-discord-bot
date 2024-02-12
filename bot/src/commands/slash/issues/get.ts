import { createEmbed } from "$lib/embed";
import db, { contains, eq } from "database/drizzle";
import { issues } from "database/drizzle/schema";
import { time } from "discord.js";
import command from "discord/commands/slash";

export default command(
	{
		desc: "Get details on an issue",
		options: {
			name: {
				type: "int",
				desc: "The name off the issue search for",
				async autocomplete(search) {
					const results = await db.query.issues.findMany({
						columns: {
							id: true,
							name: true,
						},
						where: contains(issues.name, search),
						orderBy: issues.name,
						limit: 5,
					});
					return Object.fromEntries(results.map(({ id, name }) => [name, id]));
				},
			},
		},
	},
	async (i, { name: id }) => {
		const issue = await db.query.issues.findFirst({
			columns: {
				createdAt: true,
				name: true,
				type: true,
				desc: true,
				closedAt: true,
			},
			where: eq(issues.id, id),
		});
		if (!issue) return i.reply("Issue not found");
		const { createdAt, name, type, desc, closedAt } = issue;

		const embed = createEmbed()
			.setTitle(`#${id} ${name}`)
			.setDescription(desc)
			.addFields(
				{
					name: "Type",
					value: `${
						type === "Bug" ? "🐛" : type === "Feature" ? "✨" : "🔧"
					} ${type}`,
				},
				{
					name: "Created",
					value: time(createdAt),
				},
			);
		if (closedAt) embed.addFields({ name: "Closed", value: time(closedAt) });
		return i.reply({
			embeds: [embed],
		});
	},
);
