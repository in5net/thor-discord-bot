import { env } from "node:process";
import command from "discord/commands/slash";
import { NSFW_FILE_NAME } from "./shared";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Get a random gif from yyyyyyy.info",
		options: {},
	},
	async i => {
		const [gif] = await prisma.$queryRaw<Array<{ name: string }>>`SELECT name
      FROM Y7File
      WHERE name != ${NSFW_FILE_NAME} AND extension = 'gif'
      ORDER BY RAND()
      LIMIT 1`;
		if (!gif) return i.reply("No image found");

		const url = `https://${env.FILES_DOMAIN}/y7/images/${gif.name}`;
		return i.reply(url);
	}
);
