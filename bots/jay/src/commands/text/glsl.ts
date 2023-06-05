import type { Buffer } from "node:buffer";
import { AttachmentBuilder } from "discord.js";
import command from "$commands/text";
import GL from "$services/gl";

const MAX_IMAGE_SIZE = 2048;

export default command(
	{
		desc: "Generates a random fractal image",
		args: {
			source: {
				type: "text",
				desc: "GLSL fragment shader source",
			},
		},
	},
	async ({ message, args: { source } }) => {
		let url: string;
		let width: number;
		let height: number;
		const image = message.attachments.first();
		if (image) {
			url = image.url;
			width = image.width || 0;
			height = image.height || 0;
			if (
				(image.width || 0) > MAX_IMAGE_SIZE ||
				(image.height || 0) > MAX_IMAGE_SIZE
			)
				throw new Error("Image is too large");
		} else {
			const size = 512;
			url = message.author.displayAvatarURL({ extension: "png", size });
			width = height = size;
		}

		const message_ = await message.channel.send("Generating...");
		const buffer = await render(url, width, height, source);

		const attachment = new AttachmentBuilder(buffer, { name: "glsl.png" });
		return message_.edit({ content: null, files: [attachment] });
	}
);

export async function render(
	url: string,
	width: number,
	height: number,
	source: string
): Promise<Buffer> {
	const gl = await GL.screen(
		width,
		height,
		`precision highp float;

uniform sampler2D tex;

varying vec2 texCoord;

void main() {
    ${source}
}`
	);

	await gl.createTexture(url, { param: gl.gl.REPEAT });

	gl.render();

	return gl.pngBuffer();
}
