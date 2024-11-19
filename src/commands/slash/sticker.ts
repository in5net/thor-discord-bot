import { replicate } from "$lib/ai/replicate";
import { getBits, subtractBits } from "$lib/ai/shared";
import db, { eq } from "$lib/database/drizzle";
import { users } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { z } from "zod";

const NAME = "Dreamshaper";
const BITS_PRICE = 4;

export default command(
  {
    desc: `Create a sticker with a transparent background from a prompt using ${NAME} (costs ${BITS_PRICE}).`,
    options: {
      prompt: {
        type: "string",
        desc: "Prompt to generate",
      },
    },
  },
  async (i, { prompt }) => {
    if (i.user.bot) {
      return i.reply(`Bots cannot use ${NAME}`);
    }

    const user = await db.query.users.findFirst({
      columns: {
        admin: true,
      },
      where: eq(users.id, i.user.id),
    });
    if (!user?.admin) {
      const bits = await getBits(i.user.id);
      if (bits < BITS_PRICE) {
        return i.reply(
          `You need ${BITS_PRICE - bits} more bits to use ${NAME}`,
        );
      }
    }

    await i.reply(`**${prompt}**
Running ${NAME}...`);

    const outputs = await replicate.run(
      "fofr/sticker-maker:58a7099052ed9928ee6a65559caa790bfa8909841261ef588686660189eb9dc8",
      {
        input: {
          steps: 20,
          width: 1024,
          height: 1024,
          prompt,
          upscale: true,
          upscale_steps: 10,
          negative_prompt: "",
        },
      },
    );
    const urls = z.array(z.string()).parse(outputs);

    await i.editReply({
      content: `**${prompt}**
${urls.join(" ")}`,
    });

    return subtractBits(i.user.id, BITS_PRICE);
  },
);
