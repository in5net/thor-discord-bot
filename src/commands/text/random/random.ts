import { AttachmentBuilder } from "discord.js";
import command from "$lib/discord/commands/text";

const size = 128;

export default command(
  {
    aliases: ["rand"],
    desc: "Generates a (literally) random image",
    args: {},
  },
  async ({ message }) => {
    const { createCanvas } = await import("@napi-rs/canvas");
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    const image = ctx.createImageData(size, size);
    image.data.set(
      new Uint8ClampedArray(size * size * 4).map(() =>
        Math.floor(Math.random() * 256),
      ),
    );
    ctx.putImageData(image, 0, 0);

    return message.reply({
      files: [new AttachmentBuilder(canvas.toBuffer("image/png"))],
    });
  },
);
