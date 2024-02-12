import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/slash";

export default command(
	{
		desc: "Sorts the pixels in an image",
		options: {
			image: {
				type: "attachment",
				desc: "The image to pixel sort",
				optional: true,
			},
		},
	},
	async (i, { image }) => {
		await i.deferReply();
		const url =
			image?.url || i.user.displayAvatarURL({ extension: "png", size: 512 });
		const { loadImage, createCanvas } = await import("@napi-rs/canvas");
		const img = await loadImage(url).catch(() => null);
		if (!img) return i.reply("Could not load image");

		const { width, height } = img;
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);

		const imageData = ctx.getImageData(0, 0, width, height);
		const { data } = imageData;
		type Color = [r: number, g: number, b: number, a: number];
		const colors: Color[] = Array.from({ length: width * height });
		for (let i = 0; i < width * height; i++) {
			colors[i] = [
				data[i * 4 + 0]!,
				data[i * 4 + 1]!,
				data[i * 4 + 2]!,
				data[i * 4 + 3]!,
			];
		}

		colors.sort((a, b) => {
			const aSum = a[0] + a[1] + a[2] + a[3];
			const bSum = b[0] + b[1] + b[2] + b[3];
			return aSum - bSum;
		});
		imageData.data.set(colors.flat());
		ctx.putImageData(imageData, 0, 0);

		return i.editReply({
			files: [new AttachmentBuilder(canvas.toBuffer("image/png"))],
		});
	},
);
