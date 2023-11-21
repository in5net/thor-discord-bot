import { radians } from "@in5net/std/math";
import { replace } from "@in5net/std/string";
import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/slash";

const size = 512;

export default command(
	{
		desc: "Generate an L-system fractal",
		options: {
			start: {
				type: "string",
				desc: "The starting string",
			},
			rules: {
				type: "string",
				desc: "The rules to use for the L-system (comma separated)",
			},
			length: {
				type: "float",
				desc: "The length of the line segments",
				default: 10,
			},
			angle: {
				type: "float",
				desc: "The angle to use for the L-system",
				default: 90,
			},
			iterations: {
				type: "int",
				desc: "The number of replacements to make",
				min: 1,
				max: 10,
				default: 5,
			},
			center: {
				type: "bool",
				desc: "Center the image",
				default: false,
			},
		},
	},
	async (i, { start, rules, length, angle, iterations, center }) => {
		await i.deferReply();

		const replacements: Record<string, string> = {};
		for (const rule of rules.replaceAll(" ", "").split(",")) {
			const [from, to] = rule.split("=");
			if (!from || !to) return i.reply(`Invalid rule: ${rule}`);
			replacements[from] = to;
		}

		let result = start;
		for (let i = 0; i < iterations; i++) {
			result = replace(result, replacements);
		}

		const { createCanvas } = await import("@napi-rs/canvas");
		const canvas = createCanvas(size, size);
		const ctx = canvas.getContext("2d");
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, size, size);
		ctx.strokeStyle = "#fff";
		if (center) ctx.translate(size / 2, size / 2);
		else ctx.translate(length, length);

		angle = radians(angle);

		for (const char of result) {
			switch (char) {
				case "A":
				case "B":
				case "F":
				case "G": {
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(0, length);
					ctx.stroke();
					ctx.translate(0, length);
					break;
				}

				case "+": {
					ctx.rotate(-angle);
					break;
				}

				case "-": {
					ctx.rotate(angle);
					break;
				}

				case "[": {
					ctx.save();
					break;
				}

				case "]": {
					ctx.restore();
					break;
				}
			}
		}

		return i.editReply({
			files: [new AttachmentBuilder(await canvas.encode("png"))],
		});
	},
);
