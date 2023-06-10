import command from "discord/commands/text";
import { imagegen } from "./shared";

export default command(
	{
		desc: "Put an image into an iPhone X",
		args: {
			image: {
				type: "image",
				desc: "Image to fill into an iPhone",
				default: "user",
			},
		},
	},
	async ({ args: { image } }) => imagegen("iphonex", { url: image.proxyURL })
);
