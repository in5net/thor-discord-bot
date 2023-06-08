import command from "discord/commands/text";
import { getRandomFile, sendFile } from "../slash/file/shared";

export default command(
	{
		aliases: ["v"],
		desc: "Get a random video",
		args: {},
	},
	async ({ message }) => {
		const file = await getRandomFile("video");
		if (!file) return message.reply("No file found");
		return sendFile(message, file);
	}
);
