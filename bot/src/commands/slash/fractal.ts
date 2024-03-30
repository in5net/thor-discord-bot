import GL from "$lib/gl";
import { randomInt } from "@in5net/std/random";
import command from "discord/commands/slash";
import { nanoid } from "nanoid";
import { type Buffer } from "node:buffer";
import { env } from "node:process";
import { filesBucket } from "storage";

const MAX_IMAGE_SIZE = 2048;

export default command(
	{
		desc: "Generates a random fractal image",
		options: {
			iterations: {
				type: "int",
				desc: "Number of iterations",
				min: 1,
				max: 32,
				default: 32,
			},
			image: {
				type: "attachment",
				desc: "The image to fractalize",
				optional: true,
			},
			user: {
				type: "user",
				desc: "The user PFP to fractalize",
				optional: true,
			},
		},
	},
	async (i, { iterations, image, user = i.user }) => {
		let url: string;
		let width: number;
		let height: number;
		if (image) {
			url = image.url;
			width = image.width || 0;
			height = image.height || 0;
			if (
				(image.width || 0) > MAX_IMAGE_SIZE ||
				(image.height || 0) > MAX_IMAGE_SIZE
			)
				return i.reply("Image is too large");
		} else {
			const size = 512;
			url = user.displayAvatarURL({ extension: "png", size });
			width = height = size;
		}

		const shapeSize = randomInt(2, 5);

		const sizeText = `${shapeSize}x${shapeSize}`;
		const text = `Generating a ${sizeText} fractal...`;
		await i.reply(text);

		const coords: Array<[x: number, y: number]> = [];
		while (!coords.length) {
			for (let x = 0; x < shapeSize; x++) {
				for (let y = 0; y < shapeSize; y++) {
					if (Math.random() < 0.5) coords.push([x, y]);
				}
			}
		}

		const buffer = await render({
			shapeSize,
			url,
			width,
			height,
			coords,
			iterations,
		});
		await i.editReply("Uploading fractal...");

		const path = `fractals/${nanoid()}.png`;
		const stream = filesBucket.file(path).createWriteStream({
			gzip: true,
			metadata: {
				metadata: {
					uid: i.user.id,
					source: url,
				},
			},
		});
		stream.end(buffer);
		const fileURL = await new Promise<string>((resolve, reject) =>
			stream
				.on("finish", () => {
					resolve(`https://${env.FILES_DOMAIN}/${path}`);
				})
				.on("error", reject),
		);

		return i.editReply(fileURL);
	},
);

export async function render({
	shapeSize,
	url,
	width,
	height,
	coords,
	iterations,
}: {
	shapeSize: number;
	url: string;
	width: number;
	height: number;
	coords: Array<[x: number, y: number]>;
	iterations: number;
}): Promise<Buffer> {
	const fragmentSource = await GL.loadFile(
		new URL("../../../assets/fractal/shader.frag", import.meta.url).pathname,
	);
	const gl = await GL.screen(
		width * shapeSize,
		height * shapeSize,
		fragmentSource.replaceAll(
			"#define COORDS_LENGTH 1",
			`#define COORDS_LENGTH ${coords.length.toString()}`,
		),
	);

	gl.uniform("iterations", "int", iterations);
	gl.uniform("size", "float", shapeSize);
	gl.uniform("coords", "ivec2[]", coords);

	await gl.createTexture(url, { param: gl.gl.REPEAT, mipmap: true });

	gl.render();

	return gl.pngBuffer();
}
