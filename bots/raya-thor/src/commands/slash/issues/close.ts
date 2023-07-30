import { env } from "node:process";
import { objectKeys } from "@in5net/limitless";
import { IssueReason } from "database";
import command from "discord/commands/slash";
import db, { and, isNull, icontains } from "database/drizzle";
import { issues } from "database/drizzle/schema";
import { createEmbed } from "$services/embed";
import prisma from "$services/prisma";

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
						where: and(icontains(issues.name, search), isNull(issues.closedAt)),
						orderBy: issues.name,
						limit: 5,
					});
					return Object.fromEntries(results.map(({ id, name }) => [name, id]));
				},
			},
			reason: {
				type: "choice",
				desc: "Reason for closing",
				choices: objectKeys(IssueReason),
			},
		},
	},
	async (i, { issue, reason }) => {
		if (i.user.id !== env.OWNER_ID)
			return i.reply("Only my owner can update issues");

		const { name } = await prisma.issue.update({
			select: {
				name: true,
			},
			data: {
				closedAt: new Date(),
				reason,
			},
			where: {
				id: issue,
			},
		});
		return i.reply({
			embeds: [
				createEmbed()
					.setTitle("Issue closed")
					.setDescription(`#${issue}: ${name}`),
			],
		});
	},
);
