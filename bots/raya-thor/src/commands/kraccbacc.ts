import type { KraccBacc } from "database";
import { FILES_DOMAIN } from "storage";
import command from "$commands/slash";
import prisma from "$services/prisma";

export default command(
	{
		desc: "Sends a random kraccbacc video",
		options: {},
	},
	async i => {
		await i.deferReply();

		const date = new Date();
		date.setMinutes(date.getMinutes() - 1);
		const [video] = await prisma.$queryRaw<KraccBacc[]>`SELECT name
      FROM KraccBacc
      WHERE sentAt < ${date} OR sentAt IS NULL
      ORDER BY RAND()
      LIMIT 1;`;
		if (!video) return i.editReply("No video found!");
		await prisma.kraccBacc.update({
			data: {
				sentAt: new Date(),
			},
			where: {
				name: video.name,
			},
		});

		const url = `https://${FILES_DOMAIN}/kraccbacc/${encodeURIComponent(
			video.name
		)}`;
		return i.editReply(url);
	}
);
