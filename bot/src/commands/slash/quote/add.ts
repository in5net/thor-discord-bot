import db, { eq } from "database/drizzle";
import { speechBubbles, users } from "database/drizzle/schema";
import command from "discord/commands/slash";
import got from "got";
import logger from "logger";
import { env } from "node:process";
import { pipeline } from "node:stream/promises";
import { filesBucket } from "storage";

export default command(
	{
		desc: "Add a speech bubble",
		options: {
			image: {
				type: "attachment",
				desc: "The image to add",
			},
		},
	},
	async (i, { image: { name, proxyURL } }) => {
		const user = await db.query.users.findFirst({
			columns: {
				admin: true,
			},
			where: eq(users.id, i.user.id),
		});
		if (!user?.admin) return i.reply("You are not an admin");

		const request = got.stream(proxyURL);
		const path = `speech-bubbles/${name}`;
		const stream = filesBucket.file(path).createWriteStream({
			gzip: true,
		});
		await pipeline(request, stream);

		await db.insert(speechBubbles).values({
			name,
		});

		const fileURL = `https://${env.FILES_DOMAIN}/${path}`;
		logger.info(`Uploaded ${fileURL}`);

		return i.reply(`Quote added
${fileURL}`);
	},
);
