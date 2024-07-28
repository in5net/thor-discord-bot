import db, { eq } from "database/drizzle";
import { chickens, users } from "database/drizzle/schema";
import command from "discord/commands/slash";
import logger from "logger";
import { env } from "node:process";
import { Writable } from "node:stream";
import { filesBucket } from "storage";

export default command(
	{
		desc: "Add a chicken",
		options: {
			file: {
				type: "attachment",
				desc: "The file to add",
			},
		},
	},
	async (i, { file: { name, proxyURL } }) => {
		const user = await db.query.users.findFirst({
			columns: {
				admin: true,
			},
			where: eq(users.id, i.user.id),
		});
		if (!user?.admin) return i.reply("You are not an admin");

		const { body } = await fetch(proxyURL);
		const path = `chicken/${name}`;
		const stream = Writable.toWeb(
			filesBucket.file(path).createWriteStream({
				gzip: true,
			}),
		);
		await body?.pipeTo(stream);

		await db.insert(chickens).values({
			name,
		});

		const fileURL = `https://${env.FILES_DOMAIN}/${path}`;
		logger.info(`Uploaded ${fileURL}`);

		return i.reply(`Chicken added
${fileURL}`);
	},
);
