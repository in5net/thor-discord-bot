import { env } from "node:process";
import command from "discord/commands/slash";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Search for an image from yyyyyyy.info",
		options: {
			file_name: {
				type: "string",
				desc: "The file name to search for",
				async autocomplete(search) {
					const images = await prisma.y7File.findMany({
						select: {
							name: true,
						},
						where: {
							name: {
								contains: search,
							},
							extension: {
								not: "gif",
							},
						},
						orderBy: {
							name: "asc",
						},
						take: 5,
					});
					return images.map(({ name }) => name);
				},
			},
		},
	},
	async (i, { file_name }) => {
		const url = `https://${env.FILES_DOMAIN}/y7/images/${file_name}`;
		return i.reply(url);
	},
);
