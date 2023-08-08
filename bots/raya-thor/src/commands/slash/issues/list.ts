import { createEmbed } from "$services/embed";
import { objectKeys } from "@in5net/limitless";
import { IssueType } from "database";
import db, { and, eq, isNotNull } from "database/drizzle";
import { issues } from "database/drizzle/schema";
import command from "discord/commands/slash";

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
		const results = await db.query.issues.findMany({
			columns: {
				id: true,
				name: true,
				type: true,
				desc: true,
			},
			where: and(
				type ? eq(issues.type, type) : undefined,
				closed ? isNotNull(issues.closedAt) : undefined,
			),
			orderBy: issues.createdAt,
			limit: 5,
		});
		return i.reply({
			embeds: [
				createEmbed()
					.setTitle("Issues")
					.addFields(
						results.map(({ id, name, type, desc }) => ({
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
