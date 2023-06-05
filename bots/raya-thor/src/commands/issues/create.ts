import { objectKeys } from "@in5net/limitless";
import { IssueType } from "database";
import command from "$commands/slash";
import { createEmbed } from "$services/embed";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Create an issue",
		options: {
			name: {
				type: "string",
				desc: "Name of the issue",
			},
			type: {
				type: "choice",
				desc: "Type of issue",
				choices: objectKeys(IssueType),
			},
			desc: {
				type: "string",
				desc: "Description of the issue",
			},
		},
	},
	async (i, { name, type, desc }) => {
		const { id } = await prisma.issue.create({
			select: {
				id: true,
			},
			data: {
				user: {
					connectOrCreate: {
						create: {
							id: i.user.id,
						},
						where: {
							id: i.user.id,
						},
					},
				},
				name,
				type,
				desc,
			},
		});
		const embed = createEmbed()
			.setTitle(`#${id} ${name}`)
			.setDescription(desc)
			.addFields({
				name: "Type",
				value: `${
					type === "Bug" ? "🐛" : type === "Feature" ? "✨" : "🔧"
				} ${type}`,
			});
		return i.reply({
			embeds: [embed],
		});
	}
);
