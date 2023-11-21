import { sleep } from "@in5net/std/async";
import { Vec2, vec2 } from "@in5net/std/math";
import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/text";
import ffmpeg from "fluent-ffmpeg";
import { nanoid } from "nanoid";
import { createReadStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const startGrid: number[][] = [
	[1, 2, 3],
	[8, 9, 4],
	[5, 6, 7],
];
const moves: number[] = [
	6, 5, 8, 6, 4, 7, 5, 8, 6, 4, 7, 5, 8, 7, 5, 8, 7, 6, 4, 5, 8, 7, 6, 8, 7, 6,
	8, 7, 5, 4, 7, 8,
];
const tMax = 5;
const fps = 30;

export default command(
	{
		desc: "Slider puzzle",
		args: {
			image: {
				type: "image",
				desc: "The image to slide",
				optional: true,
			},
		},
	},
	async ({ message, args: { image } }) => {
		const url =
			image?.url ||
			message.author.displayAvatarURL({ extension: "png", size: 256 });
		const { loadImage, createCanvas } = await import("@napi-rs/canvas");
		const img = await loadImage(url).catch(() => null);
		if (!img) return message.reply("Could not load image");
		const { width, height } = img;
		if (width > 512 || height > 512)
			return message.reply("Image is too large (max 512x512)");

		message = await message.reply("Processing...");

		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, width, height);

		const cellWidth = width / 3;
		const cellHeight = height / 3;

		const temporaryDir = join(tmpdir(), nanoid());
		await mkdir(temporaryDir);

		let index = 0;
		async function write() {
			const path = join(
				temporaryDir,
				`frame${(index++).toString().padStart(4, "0")}.png`,
			);
			await writeFile(path, await canvas.encode("png"));
			await sleep(0);
		}

		const grid = structuredClone(startGrid);

		for (let y = 0; y < 3; y++) {
			const row = grid[y]!;
			for (let x = 0; x < 3; x++) {
				const n = row[x]!;
				const sx = (n - 1) % 3;
				const sy = Math.floor((n - 1) / 3);
				if (n !== 9)
					ctx.drawImage(
						img,
						sx * cellWidth,
						sy * cellHeight,
						cellWidth,
						cellHeight,
						x * cellWidth,
						y * cellHeight,
						cellWidth,
						cellHeight,
					);
			}
		}

		await write();

		for (const move of moves) {
			const start = vec2();
			const target = vec2();
			for (let y = 0; y < 3; y++) {
				const row = grid[y]!;
				for (let x = 0; x < 3; x++) {
					const n = row[x];
					if (n === move) start.set([x, y]);
					else if (n === 9) target.set([x, y]);
				}
			}

			const sx = (move - 1) % 3;
			const sy = Math.floor((move - 1) / 3);

			for (let t = 0; t <= tMax; t++) {
				ctx.fillRect(
					start.x * cellWidth,
					start.y * cellHeight,
					cellWidth,
					cellHeight,
				);
				ctx.fillRect(
					target.x * cellWidth,
					target.y * cellHeight,
					cellWidth,
					cellHeight,
				);

				const current = Vec2.lerp(start, target, t / tMax);
				ctx.drawImage(
					img,
					sx * cellWidth,
					sy * cellHeight,
					cellWidth,
					cellHeight,
					current.x * cellWidth,
					current.y * cellHeight,
					cellWidth,
					cellHeight,
				);

				await write();
			}

			[grid[start.y]![start.x], grid[target.y]![target.x]] = [
				grid[target.y]![target.x]!,
				grid[start.y]![start.x]!,
			];
		}

		const name = "slider.mp4";
		await new Promise((resolve, reject) =>
			ffmpeg({ cwd: temporaryDir })
				.input("frame%04d.png")
				.fps(fps)
				.videoCodec("libx264")
				.outputOptions(["-pix_fmt yuv420p"])
				.save(name)
				.once("end", resolve)
				.once("error", reject),
		);

		const outputPath = join(temporaryDir, name);
		const stream = createReadStream(outputPath);
		stream.once("close", async () => rm(temporaryDir, { recursive: true }));

		return message.edit({
			files: [new AttachmentBuilder(stream, { name })],
		});
	},
);
