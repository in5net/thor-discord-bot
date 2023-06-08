import { randomInt, vec2, Vector2 } from "@in5net/limitless";
import { createCanvas } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/slash";

const size = 1024;
const r = size / 2;
const itersPerFrame = 1000;
const frames = 1000;

export default command(
	{
		desc: "Creates chaos",
		options: {
			num_points: {
				type: "int",
				desc: "How many points to run with",
				min: 2,
				max: 16,
				default: 3,
			},
			stride: {
				type: "float",
				desc: "How far to move towards a point",
				min: 0,
				max: 1,
				default: 0.5,
			},
		},
	},
	async (i, { num_points, stride }) => {
		await i.deferReply();
		const canvas = createCanvas(size, size);
		const ctx = canvas.getContext("2d");

		const points: Vector2[] = [];
		for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / num_points) {
			const point = vec2(r, 0).setAngle(a).add(r);
			points.push(point);
		}

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, size, size);

		const current = Vector2.random(size);
		for (let i = 0; i < frames; i++) {
			for (let index = 0; index < itersPerFrame; index++) {
				const index = randomInt(points.length);

				const pt = points[index]!;

				current.lerp(pt, stride);

				ctx.fillStyle = `hsl(${index * (360 / points.length)},100%,50%)`;
				ctx.fillRect(current.x, current.y, 1, 1);
			}

			await new Promise(resolve => setImmediate(resolve));
		}

		console.log("Done");
		return i.editReply({
			files: [new AttachmentBuilder(canvas.toBuffer("image/png"))],
		});
	}
);
