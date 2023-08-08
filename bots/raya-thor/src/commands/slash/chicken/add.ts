import { ADMIN_IDS } from "$services/env";
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
		if (!ADMIN_IDS.includes(i.user.id)) return i.reply("You are not an admin");

		const { body } = await fetch(proxyURL);
		const path = `chicken/${name}`;
		const stream = Writable.toWeb(
			filesBucket.file(path).createWriteStream({
				gzip: true,
			}),
		);
		await body?.pipeTo(stream);
		const fileURL = `https://${env.ILES_DOMAIN}/${path}`;
		logger.info(`Uploaded ${fileURL}`);

		return i.reply(`Chicken added
${fileURL}`);
	},
);
