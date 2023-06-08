import command from "discord/commands/slash";
import { getRandomFile, sendFile } from "./shared";

export default command(
	{
		desc: "Get a random image",
		options: {},
	},
	async i => {
		const file = await getRandomFile("image");
		if (!file) return i.reply("No file found");
		return sendFile(i, file);
	}
);
