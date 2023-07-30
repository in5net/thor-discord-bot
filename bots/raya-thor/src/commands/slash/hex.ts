import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/slash";

const size = 16;

export default command(
	{
		desc: "Gives you a 16x16 image of a hex code",
		options: {
			code: {
				type: "string",
				desc: "The hex code to convert to an image",
			},
		} as const,
	},
	async (i, { code }) => {
		const { createCanvas } = await import("@napi-rs/canvas");
		const canvas = createCanvas(size, size);
		const ctx = canvas.getContext("2d");

		if (code.startsWith("#")) code = code.slice(1);
		if (![3, 4, 6, 8].includes(code.length)) return i.reply("Invalid hex code");

		ctx.fillStyle = `#${code}`;
		ctx.fillRect(0, 0, size, size);

		return i.reply({
			files: [new AttachmentBuilder(canvas.toBuffer("image/png"))],
		});
	},
);
