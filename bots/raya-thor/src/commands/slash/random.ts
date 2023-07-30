import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/slash";

const size = 128;

export default command(
	{
		desc: "Generates a (literally) random image",
		options: {},
	},
	async i => {
		await i.deferReply();
		const { createCanvas } = await import("@napi-rs/canvas");
		const canvas = createCanvas(size, size);
		const ctx = canvas.getContext("2d");

		const image = ctx.createImageData(size, size);
		image.data.set(
			new Uint8ClampedArray(size * size * 4).map(() =>
				Math.floor(Math.random() * 256),
			),
		);
		ctx.putImageData(image, 0, 0);

		return i.editReply({
			files: [new AttachmentBuilder(canvas.toBuffer("image/png"))],
		});
	},
);
