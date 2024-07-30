import { AttachmentBuilder } from "discord.js";
import command from "discord/commands/text";
import ffmpeg from "fluent-ffmpeg";
import got from "got";
import { nanoid } from "nanoid";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";

export default command(
	{
		desc: "Give an image a few more JPEG artifacts",
		args: {
			image: {
				type: "image",
				desc: "The image to compress",
			},
		},
	},
	async ({ message, args: { image } }) => {
		message = await message.reply("Processing...");

		const temporaryDir = join(tmpdir(), nanoid());
		await mkdir(temporaryDir);
		const fileName = image.url.split("/").pop() || "input";
		const filePath = join(temporaryDir, fileName);

		await pipeline(got.stream(image.url), createWriteStream(filePath));

		const name = "output.jpg";
		await new Promise((resolve, reject) =>
			ffmpeg({ cwd: temporaryDir })
				.input(fileName)
				.addOption("-q:v", "31")
				.save(name)
				.on("end", resolve)
				.on("error", reject),
		);

		const outputPath = join(temporaryDir, name);
		const stream = createReadStream(outputPath);
		stream.once("close", async () => rm(temporaryDir, { recursive: true }));

		return message.edit({
			files: [new AttachmentBuilder(stream, { name })],
		});
	},
);
