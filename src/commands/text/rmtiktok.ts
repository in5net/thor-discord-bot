import { AttachmentBuilder } from "discord.js";
import command from "$lib/discord/commands/text";
import got from "got";
import { nanoid } from "nanoid";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { $ } from "zx";

export default command(
  {
    desc: "Removes the last 4 seconds of a TikTok video",
    args: {
      video: {
        type: "video",
        desc: "The video to remove the last bit of",
      },
    },
  },
  async ({ message, args: { video } }) => {
    message = await message.reply("Processing...");

    const temporaryDir = join(tmpdir(), nanoid());
    await mkdir(temporaryDir);
    const url = new URL(video);
    const fileName = url.pathname.split("/").pop() || "input";
    const fileExt = fileName.split(".").pop() || "mp4";
    const fileBase = fileName.replace(`.${fileExt}`, "");
    const filePath = join(temporaryDir, fileName);

    await pipeline(got.stream(video), createWriteStream(filePath));

    const $$ = $({ cwd: temporaryDir });

    const rawDuration =
      await $$`ffprobe -v error -show_entries format=duration -of csv=p=0 ${fileName}`.text();
    const duration = Number.parseFloat(rawDuration) - 4;

    // Ffmpeg -ss 00:00:00 -to $duration -i input.mp4 -c copy output.mp4
    const outputFileName = `${fileBase}_trimmed.${fileExt}`;
    await $$`ffmpeg -i ${fileName} -to ${duration} -c copy ${outputFileName}`.text();

    const outputPath = join(temporaryDir, outputFileName);
    const stream = createReadStream(outputPath);
    stream.once("close", async () => rm(temporaryDir, { recursive: true }));

    return message.edit({
      files: [new AttachmentBuilder(stream, { name: outputFileName })],
    });
  },
);
