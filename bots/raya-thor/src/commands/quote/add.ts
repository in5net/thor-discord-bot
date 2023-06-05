import { Writable } from "node:stream";
import { FILES_DOMAIN, filesBucket } from "storage";
import command from "$commands/slash";
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

		const { body } = await fetch(proxyURL);
		const path = `speech-bubbles/${name}`;
		const stream = Writable.toWeb(
			filesBucket.file(path).createWriteStream({
				gzip: true,
			})
		);
		await body?.pipeTo(stream);
		const fileURL = `https://${FILES_DOMAIN}/${path}`;
		console.log(`Uploaded ${fileURL}`);

		return i.reply(`Quote added
${fileURL}`);
	}
);
