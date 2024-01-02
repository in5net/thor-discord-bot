import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/text";

const size = 16;

export default command(
	{
		aliases: ["color"],
		desc: "Gives you a 16x16 image of a hex code",
		args: {
			code: {
				type: "word",
				desc: "The hex code to convert to an image",
				min: 3,
				max: 9,
			},
		},
		examples: ["#ff0000", "ff0000", "f00", "#ff05"],
	},
	async ({ message, args: { code } }) => {
		const { createCanvas } = await import("@napi-rs/canvas");
		const canvas = createCanvas(size, size);
		const ctx = canvas.getContext("2d");

		if (code.startsWith("#")) code = code.slice(1);
		if (![3, 4, 6, 8].includes(code.length))
			return message.reply("Invalid hex code");

		ctx.fillStyle = `#${code}`;
		ctx.fillRect(0, 0, size, size);

		return message.reply({
			files: [new AttachmentBuilder(canvas.toBuffer("image/png"))],
		});
	},
);
