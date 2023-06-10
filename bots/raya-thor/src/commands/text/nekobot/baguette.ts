import command from "discord/commands/text";
import { imagegen } from "./shared";

export default command(
	{
		desc: "Is that a threat?",
		args: {
			image: {
				type: "image",
				desc: "Any image URL to generate, can be user avatar or anything",
				default: "user",
			},
		},
	},
	async ({ args: { image } }) => imagegen("baguette", { url: image.proxyURL })
);
