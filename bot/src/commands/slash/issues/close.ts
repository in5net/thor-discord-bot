import { createEmbed } from "$lib/embed";
import db, { and, contains, eq, isNull } from "database/drizzle";
import { issues } from "database/drizzle/schema";
import command from "discord/commands/slash";
import { env } from "node:process";

export default command(
	{
		desc: "Update an issue",
		options: {
			issue: {
				type: "int",
				desc: "The name off the issue search for",
				async autocomplete(search) {
					const results = await db.query.issues.findMany({
						columns: {
							id: true,
							name: true,
						},
						where: and(contains(issues.name, search), isNull(issues.closedAt)),
						orderBy: issues.name,
						limit: 5,
					});
					return Object.fromEntries(results.map(({ id, name }) => [name, id]));
				},
			},
			reason: {
				type: "choice",
				desc: "Reason for closing",
				choices: issues.reason.enumValues,
			},
		},
	},
	async (i, { issue, reason }) => {
		if (i.user.id !== env.OWNER_ID)
			return i.reply("Only my owner can update issues");

		const result = await db.query.issues.findFirst({
			columns: {
				name: true,
			},
			where: eq(issues.id, issue),
		});
		if (!result) return i.reply("Issue not found");

		await db
			.update(issues)
			.set({
				closedAt: new Date(),
				reason,
			})
			.where(eq(issues.id, issue));

		return i.reply({
			embeds: [
				createEmbed()
					.setTitle("Issue closed")
					.setDescription(`#${issue}: ${result.name}`),
			],
		});
	},
);
