import { time } from "discord.js";
import command from "$commands/slash";
import { createEmbed } from "$services/embed";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Get details on an issue",
		options: {
			name: {
				type: "int",
				desc: "The name off the issue search for",
				async autocomplete(search) {
					const issues = await prisma.issue.findMany({
						select: {
							id: true,
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
					return Object.fromEntries(issues.map(({ id, name }) => [name, id]));
				},
			},
		},
	},
	async (i, { name: id }) => {
		const issue = await prisma.issue.findUnique({
			select: {
				createdAt: true,
				name: true,
				type: true,
				desc: true,
				closedAt: true,
			},
			where: {
				id,
			},
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
				}
			);
		if (closedAt) embed.addFields({ name: "Closed", value: time(closedAt) });
		return i.reply({
			embeds: [embed],
		});
	}
);
