import { FILES_DOMAIN } from "storage";
import { getRandomFile, sendFile, types } from "./shared";
import command from "$commands/slash";

export default command(
	{
		desc: "Get a random file",
		options: {
			type: {
				type: "choice",
				desc: "Type of file to get",
				choices: types,
				optional: true,
			},
			googas: {
				type: "bool",
				desc: "googas + gradi",
				optional: true,
			},
		},
	},
	async (i, { type, googas }) => {
		if (googas)
			return i.reply(
				["googas.mp4", "gradi.png"]
					.map(name => `https://${FILES_DOMAIN}/discord/${name}`)
					.join(" ")
			);

		const file = await getRandomFile(type);
		if (!file) return i.reply("No file found");
		return sendFile(i, file);
	}
);
