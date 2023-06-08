import { map } from "@in5net/limitless";
import { createCanvas } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/slash";
import runner from "./equation/mod";

const size = 512;
const ticks = 20;
const gridSize = size / ticks;

export default command(
	{
		desc: "Makes a 2D xy graph",
		options: {
			equation: {
				type: "string",
				desc: "The equation to graph",
			},
		},
	},
	async (i, { equation }) => {
		await i.deferReply();
		const canvas = createCanvas(size, size);
		const ctx = canvas.getContext("2d");

		function line(x1: number, y1: number, x2: number, y2: number) {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		}

		// Background
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, size, size);

		// Grid lines
		ctx.strokeStyle = "#ccc";
		for (let i = gridSize; i < size; i += gridSize) {
			line(0, i, size, i);
			line(i, 0, i, size);
		}

		// Axes
		ctx.strokeStyle = "#000";
		line(0, size / 2, size, size / 2);
		line(size / 2, 0, size / 2, size);

		const sides = equation.split("=");
		const eq = sides[sides.length - 1] || "";
		const run = runner(eq);

		// Curve
		ctx.strokeStyle = "#f00";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(0, size / 2);
		for (let i = 0; i < size; i++) {
			const x = map(i, 0, size, -ticks / 2, ticks / 2);
			const y = run(x);
			ctx.lineTo(i, map(y, -ticks / 2, ticks / 2, size, 0));
		}

		ctx.stroke();

		return i.editReply({
			files: [new AttachmentBuilder(await canvas.encode("png"))],
		});
	}
);
