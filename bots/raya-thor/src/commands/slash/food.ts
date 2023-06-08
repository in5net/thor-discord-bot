import { env } from "node:process";
import command from "discord/commands/slash";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Get a random gif from yyyyyyy.info",
		options: {},
	},
	async i => {
		const [gif] = await prisma.$queryRaw<Array<{ name: string }>>`SELECT name
      FROM RotatingFood
      ORDER BY RAND()
      LIMIT 1`;
		if (!gif) return i.reply("No food found");

		const url = `https://${env.FILES_DOMAIN}/rotatingfood5/${encodeURIComponent(
			gif.name
		)}`;
		return i.reply(url);
	}
);
