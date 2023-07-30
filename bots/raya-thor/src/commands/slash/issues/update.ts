import { env } from "node:process";
import { objectKeys } from "@in5net/limitless";
import { IssueType } from "database";
import command from "discord/commands/slash";
import db, { and, eq, icontains } from "database/drizzle";
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
				async autocomplete(search, i) {
					const results = await db.query.issues.findMany({
						columns: {
							id: true,
							name: true,
						},
						where: and(
							i.user.id === env.OWNER_ID
								? undefined
								: eq(issues.userId, i.user.id),
							icontains(issues.name, search),
						),
						orderBy: issues.name,
						limit: 5,
					});
					return Object.fromEntries(results.map(({ id, name }) => [name, id]));
				},
			},
			type: {
				type: "choice",
				desc: "Type of issue",
				choices: objectKeys(IssueType),
				optional: true,
			},
			desc: {
				type: "string",
				desc: "Description of the issue",
				optional: true,
			},
		},
	},
	async (i, { issue, type, desc }) => {
		const { name } = await prisma.issue.update({
			select: {
				name: true,
			},
			data: {
				type,
				desc,
			},
			where: {
				id: issue,
				userId: i.user.id === env.OWNER_ID ? undefined : i.user.id,
			},
		});
		return i.reply({
			embeds: [
				createEmbed()
					.setTitle("Issue updated")
					.setDescription(`#${issue}: ${name}`),
			],
		});
	},
);
