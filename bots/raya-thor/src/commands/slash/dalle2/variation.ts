import { getBits, subtractBits } from "$services/ai/shared";
import { openai } from "$services/openai";
import { type ResponseTypes } from "@nick.heiner/openai-edge";
import db, { eq } from "database/drizzle";
import { users } from "database/drizzle/schema";
import command from "discord/commands/slash";
import got from "got";
import { nanoid } from "nanoid";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { BITS_PRICE } from "./shared";

export default command(
	{
		desc: `Create an image based on an input image using OpenAI's DALL·E 2 (costs ${BITS_PRICE} bits)`,
		options: {
			image: {
				type: "attachment",
				desc: "Image to make a variation of",
			},
			n: {
				type: "int",
				desc: "Number of images to generate",
				default: 1,
				min: 1,
				max: 4,
			},
		},
	},
	async (i, { image, n }) => {
		if (i.user.bot) return i.reply("Bots cannot use DALL·E 2");
		const cost = BITS_PRICE * n;

		const user = await db.query.users.findFirst({
			columns: {
				admin: true,
			},
			where: eq(users.id, i.user.id),
		});
		if (!user?.admin) {
			const bits = await getBits(i.user.id);
			if (bits < cost)
				return i.reply(`You need ${cost - bits} more bits to use DALL·E 2`);
		}

		if (image.size > 1024 * 1024 * 4) return i.reply("Image must be under 4MB");
		if (image.contentType !== "image/png")
			return i.reply("Image must be a PNG");
		if (image.width !== image.height) return i.reply("Image must be square");
		await i.deferReply();

		const request = got.stream(image.proxyURL);

		const temporaryDir = join(tmpdir(), nanoid());
		await mkdir(temporaryDir);
		const filePath = join(temporaryDir, "input.png");
		await pipeline(request, createWriteStream(filePath));

		const response = await openai.createImageVariation(
			createReadStream(filePath) as unknown as File,
			1,
			"1024x1024",
			"url",
			i.user.id,
		);
		const { data } =
			(await response.json()) as ResponseTypes["createImageVariation"];

		await i.editReply({
			files: data.map(({ url = "" }) => url),
		});
		await subtractBits(i.user.id, cost);
		return rm(temporaryDir, { recursive: true });
	},
);
