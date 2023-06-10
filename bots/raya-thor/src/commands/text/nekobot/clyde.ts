import command from "discord/commands/text";
import { imagegen } from "./shared";

export default command(
	{
		desc: "Hi Clyde!",
		args: {
			text: {
				type: "text",
				desc: "Text to clydify",
			},
		},
	},
	async ({ args: { text } }) => imagegen("clyde", { text })
);
