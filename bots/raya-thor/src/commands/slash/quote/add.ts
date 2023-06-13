import { env } from "node:process";
import { pipeline } from "node:stream/promises";
import { filesBucket } from "storage";
import command from "discord/commands/slash";
import got from "got";
import { ADMIN_IDS } from "$services/env";

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
		if (!ADMIN_IDS.includes(i.user.id)) return i.reply("You are not an admin");

		const request = got.stream(proxyURL);
		const path = `speech-bubbles/${name}`;
		const stream = filesBucket.file(path).createWriteStream({
			gzip: true,
		});
		await pipeline(request, stream);
		const fileURL = `https://${env.FILES_DOMAIN}/${path}`;
		console.log(`Uploaded ${fileURL}`);

		return i.reply(`Quote added
${fileURL}`);
	}
);
