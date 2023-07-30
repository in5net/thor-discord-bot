import { objectKeys } from "@in5net/limitless";
import { IssueType } from "database";
import command from "discord/commands/slash";
import { createEmbed } from "$services/embed";
import prisma from "$services/prisma";

export default command(
	{
		desc: "List all issues",
		options: {
			type: {
				type: "choice",
				desc: "Type of issue",
				choices: objectKeys(IssueType),
				optional: true,
			},
			closed: {
				type: "bool",
				desc: "Show closed issues",
				default: false,
			},
		},
	},
	async (i, { type, closed }) => {
		const issues = await prisma.issue.findMany({
			select: {
				id: true,
				name: true,
				type: true,
				desc: true,
			},
			where: {
				type,
				closedAt: closed
					? {
							not: null,
					  }
					: null,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return i.reply({
			embeds: [
				createEmbed()
					.setTitle("Issues")
					.addFields(
						issues.map(({ id, name, type, desc }) => ({
							name: `#${id} ${
								type === "Bug" ? "🐛" : type === "Feature" ? "✨" : "🔧"
							} ${name}`,
							value: desc,
						})),
					),
			],
		});
	},
);
