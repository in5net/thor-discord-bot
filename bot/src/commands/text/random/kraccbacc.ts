import db, { eq, isNotNull, lt, sql } from "database/drizzle";
import { kraccBaccVideos } from "database/drizzle/schema";
import command from "discord/commands/text";
import { env } from "node:process";

export default command(
	{
		desc: "Sends a random kraccbacc video",
		args: {},
	},
	async ({ message }) => {
		const date = new Date();
		date.setMinutes(date.getMinutes() - 1);
		const video = await db.query.kraccBaccVideos.findFirst({
			columns: {
				name: true,
			},
			where: (table, { or }) =>
				or(lt(table.sentAt, date), isNotNull(table.sentAt)),
			orderBy: sql`random()`,
		});
		if (!video) return message.reply("No video found!");
		await db
			.update(kraccBaccVideos)
			.set({
				sentAt: new Date(),
			})
			.where(eq(kraccBaccVideos.name, video.name));

		const url = `https://${env.FILES_DOMAIN}/kraccbacc/${encodeURIComponent(
			video.name,
		)}`;
		return message.reply(url);
	},
);
