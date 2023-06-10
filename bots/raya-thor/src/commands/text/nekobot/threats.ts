import command from "discord/commands/text";
import { imagegen } from "./shared";

export default command(
	{
		desc: "Is that a threat?",
		args: {
			image: {
				type: "image",
				desc: "Image URL to add to template",
				default: "user",
			},
		},
	},
	async ({ args: { image } }) => imagegen("threats", { url: image.proxyURL })
);
