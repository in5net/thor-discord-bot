import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/slash";
import ffmpeg from "fluent-ffmpeg";
import { nanoid } from "nanoid";
import { createReadStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const size = 512;

export default command(
	{
		desc: "Run Conway's Game of Life",
		options: {
			iterations: {
				type: "int",
				desc: "Number of iterations to run",
				min: 1,
				max: 256,
				default: 100,
			},
			cell_size: {
				type: "int",
				desc: "Pixel size of each cell",
				min: 2,
				max: size,
				default: 8,
			},
			fps: {
				type: "int",
				desc: "Frames per second",
				min: 1,
				max: 60,
				default: 12,
			},
		},
	},
	async (i, { iterations, cell_size, fps }) => {
		await i.deferReply();

		const temporaryDir = join(tmpdir(), nanoid());
		await mkdir(temporaryDir);

		const { createCanvas } = await import("@napi-rs/canvas");
		const canvas = createCanvas(size, size);
		const ctx = canvas.getContext("2d");

		const length = size / cell_size;
		let grid = Array.from<boolean[]>({ length }).map(() =>
			Array.from<boolean>({ length })
				.fill(false)
				.map(() => Math.random() > 0.5),
		);

		for (let iter = 0; iter < iterations; iter++) {
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, size, size);
			ctx.fillStyle = "#fff";
			for (let i = 0; i < length; i++) {
				for (let index = 0; index < length; index++) {
					const x = i * cell_size;
					const y = index * cell_size;
					if (grid[i]?.[index]) ctx.fillRect(x, y, cell_size, cell_size);
				}
			}

			const next = Array.from<boolean[]>({ length }).map(() =>
				Array.from<boolean>({ length }).fill(false),
			);

			for (let x = 0; x < length; x++) {
				for (let y = 0; y < length; y++) {
					const state = grid[x]?.[y] || false;
					const neighbors = countNeighbors(x, y);

					if (!state && neighbors === 3) next[x]![y] = true;
					else if (state && (neighbors < 2 || neighbors > 3))
						next[x]![y] = false;
					else next[x]![y] = state;
				}
			}

			grid = next;

			const path = join(
				temporaryDir,
				`frame${iter.toString().padStart(4, "0")}.png`,
			);
			await writeFile(path, canvas.toBuffer("image/png"));

			await new Promise(resolve => setImmediate(resolve));
		}

		function countNeighbors(x: number, y: number) {
			let sum = 0;
			for (let i = -1; i < 2; i++) {
				for (let index = -1; index < 2; index++) {
					const col = (x + i + length) % length;
					const row = (y + index + length) % length;
					if ((i || index) && grid[col]?.[row]) sum++;
				}
			}

			return sum;
		}

		await new Promise((resolve, reject) =>
			ffmpeg({ cwd: temporaryDir })
				.input("frame%04d.png")
				.fps(fps)
				.videoCodec("libx264")
				.outputOptions(["-pix_fmt yuv420p"])
				.save("output.mp4")
				.once("end", resolve)
				.once("error", reject),
		);
		console.log(temporaryDir);

		const outputPath = join(temporaryDir, "output.mp4");
		const stream = createReadStream(outputPath);
		stream.once("close", async () => rm(temporaryDir, { recursive: true }));

		console.log("Done");
		return i.editReply({
			files: [new AttachmentBuilder(stream)],
		});
	},
);
