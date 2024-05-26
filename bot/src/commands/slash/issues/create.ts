import { createEmbed } from "$lib/embed";
import prisma from "$lib/prisma";
import command from "discord/commands/slash";

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
				choices: ["Bug", "Feature", "Enhancement"],
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
							id: BigInt(i.user.id),
						},
						where: {
							id: BigInt(i.user.id),
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
					type === "Bug" ? "🐛"
					: type === "Feature" ? "✨"
					: "🔧"
				} ${type}`,
			});
		return i.reply({
			embeds: [embed],
		});
	},
);
