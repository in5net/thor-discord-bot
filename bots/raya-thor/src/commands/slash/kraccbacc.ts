import { env } from "node:process";
import command from "discord/commands/slash";
import db, { lt, isNotNull, sql } from "database/drizzle";
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
		const video = await db.query.kraccBacc.findFirst({
			columns: {
				name: true,
			},
			where: (table, { or }) =>
				or(lt(table.sentAt, date), isNotNull(table.sentAt)),
			orderBy: sql`rand()`,
		});
		if (!video) return i.editReply("No video found!");
		await prisma.kraccBacc.update({
			data: {
				sentAt: new Date(),
			},
			where: {
				name: video.name,
			},
		});

		const url = `https://${env.FILES_DOMAIN}/kraccbacc/${encodeURIComponent(
			video.name
		)}`;
		return i.editReply(url);
	}
);
