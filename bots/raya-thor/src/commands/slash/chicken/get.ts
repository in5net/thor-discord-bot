import { env } from "node:process";
import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/slash";
import db, { lt, isNotNull, sql } from "database/drizzle";
import prisma from "$services/prisma";

const stickenFileName = "stick.png";

export default command(
	{
		desc: "Chicken!",
		options: {
			sticken: {
				desc: "Sticken!",
				type: "bool",
				optional: true,
			},
		},
	},
	async (i, { sticken }) => {
		await i.deferReply();
		let name: string;
		if (sticken) name = stickenFileName;
		else {
			const date = new Date();
			date.setMinutes(date.getMinutes() - 1);
			const chicken = await db.query.chickens.findFirst({
				columns: {
					name: true,
				},
				where: (table, { or }) =>
					or(lt(table.sentAt, date), isNotNull(table.sentAt)),
				orderBy: sql`rand()`,
			});
			if (!chicken) return i.editReply("No chicken found!");
			await prisma.chicken.update({
				data: {
					sentAt: new Date(),
				},
				where: {
					name: chicken.name,
				},
			});
			name = chicken.name;
		}

		const url = `https://${env.FILES_DOMAIN}/chicken/${name}`;
		if (name.endsWith(".mp3"))
			return i.editReply({
				content: null,
				files: [new AttachmentBuilder(url)],
			});
		return i.editReply(url);
	},
);
