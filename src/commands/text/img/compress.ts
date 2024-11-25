import command from "$lib/discord/commands/text";
import { AttachmentBuilder } from "discord.js";
import ffmpeg from "fluent-ffmpeg";
import got from "got";
import { nanoid } from "nanoid";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const scale = 4;
const quality = 31;

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

    const temporaryDir = path.join(tmpdir(), nanoid());
    await mkdir(temporaryDir);
    const fileName = image.url.split("/").pop() || "input";
    const filePath = path.join(temporaryDir, fileName);

    await pipeline(got.stream(image.url), createWriteStream(filePath));

    await new Promise((resolve, reject) =>
      ffmpeg({ cwd: temporaryDir })
        .input(fileName)
        .videoFilter(`scale=iw/${scale}:ih/${scale}`)
        .save("downsampled.jpg")
        .on("end", resolve)
        .on("error", reject),
    );

    const outputFileName = "output.jpg";
    await new Promise((resolve, reject) =>
      ffmpeg({ cwd: temporaryDir })
        .input("downsampled.jpg")
        .videoFilter(`scale=iw*${scale}:ih*${scale}`)
        .addOption(`-q:v ${quality}`)
        .save(outputFileName)
        .on("end", resolve)
        .on("error", reject),
    );

    const outputPath = path.join(temporaryDir, outputFileName);
    const stream = createReadStream(outputPath);
    stream.once("close", () => {
      void rm(temporaryDir, { recursive: true });
    });

    return message.edit({
      files: [new AttachmentBuilder(stream, { name: outputFileName })],
    });
  },
);
