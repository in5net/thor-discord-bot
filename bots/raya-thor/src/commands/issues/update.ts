import process from "node:process";
import { objectKeys } from "@in5net/limitless";
import { IssueType } from "database";
import command from "$commands/slash";
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
					const issues = await prisma.issue.findMany({
						select: {
							id: true,
							name: true,
						},
						where: {
							name: {
								contains: search,
							},
							userId:
								i.user.id === process.env.OWNER_ID ? undefined : i.user.id,
						},
						orderBy: {
							name: "asc",
						},
						take: 5,
					});
					return Object.fromEntries(issues.map(({ id, name }) => [name, id]));
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
				userId: i.user.id === process.env.OWNER_ID ? undefined : i.user.id,
			},
		});
		return i.reply({
			embeds: [
				createEmbed()
					.setTitle("Issue updated")
					.setDescription(`#${issue}: ${name}`),
			],
		});
	}
);
