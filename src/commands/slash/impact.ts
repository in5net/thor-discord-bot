import command from "$lib/discord/commands/slash";
import logger from "$lib/logger";
import { memo } from "@iz7n/std/fn";
import { AttachmentBuilder } from "discord.js";

const font = "Impact";
const registerFont = memo(async () => {
  const { GlobalFonts } = await import("@napi-rs/canvas");
  const success = GlobalFonts.registerFromPath(
    new URL("../../assets/fonts/impact.ttf", import.meta.url).pathname,
    font,
  );
  logger.debug(`${font} font registered:`, success);
});

export default command(
  {
    desc: `Generate an image of ${font} font text`,
    options: {
      text: {
        desc: "The text to generate",
        type: "string",
      },
      width: {
        desc: "The width of the image",
        type: "int",
        default: 400,
        min: 1,
        max: 1000,
      },
      font_size: {
        desc: "The font size",
        type: "int",
        default: 24,
      },
      border_width: {
        desc: "The border width",
        type: "int",
        default: 1,
      },
    },
  },
  async (i, { text, width, font_size, border_width }) => {
    await i.deferReply();
    const canvas = await generate({ text, width, font_size, border_width });
    return i.editReply({
      files: [new AttachmentBuilder(canvas.toBuffer("image/png"))],
    });
  },
);

export async function generate({
  text,
  font_size,
  width,
  border_width,
}: {
  text: string;
  width: number;
  font_size: number;
  border_width: number;
}) {
  await registerFont();
  const { createCanvas } = await import("@napi-rs/canvas");
  const canvas = createCanvas(width, font_size);
  logger.debug("canvas:", canvas.width, "x", canvas.height);
  const ctx = canvas.getContext("2d");

  ctx.strokeStyle = "#000";
  ctx.lineWidth = border_width;
  ctx.fillStyle = "#fff";
  ctx.font = `${font_size}px ${font}`;
  ctx.textBaseline = "hanging";
  ctx.fillText(text, 0, 0);
  ctx.strokeText(text, 0, 0);
  return canvas;
}
