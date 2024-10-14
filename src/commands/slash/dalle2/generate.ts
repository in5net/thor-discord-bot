import { getBits, subtractBits } from "$lib/ai/shared";
import { openai } from "$lib/openai";
import db, { eq } from "$lib/database/drizzle";
import { users } from "$lib/database/drizzle/schema";
import command from "$lib/discord/commands/slash";
import { BITS_PRICE } from "./shared";

export default command(
  {
    desc: `Create an image from a prompt using OpenAI's DALL·E 2 (costs ${BITS_PRICE} bits)`,
    options: {
      prompt: {
        type: "string",
        desc: "Prompt to generate",
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
  async (i, { prompt, n }) => {
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
        return i.reply(`You need ${cost - bits} more bits to do this`);
    }

    await i.deferReply();

    const { data } = await openai.images.generate({
      prompt,
      n,
      size: "1024x1024",
      user: i.user.id,
    });

    await i.editReply({
      content: prompt,
      files: data.map(({ url = "" }) => url),
    });
    return subtractBits(i.user.id, cost);
  },
);
