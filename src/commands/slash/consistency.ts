import { replicate } from "$lib/ai/replicate";
import { getBits, subtractBits } from "$lib/ai/shared";
import db, { eq } from "$lib/database/drizzle";
import { users } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { z } from "zod";

const NAME = "Latent Consistency Model";
const BITS_PER_IMAGE = 1;

export default command(
  {
    desc: `Create images from a prompt using ${NAME} (costs ${BITS_PER_IMAGE} bits per image).`,
    options: {
      prompt: {
        type: "string",
        desc: "Prompt to generate",
      },
      num_images: {
        type: "int",
        desc: "Number of images to generate",
        min: 1,
        max: 4,
        default: 1,
      },
    },
  },
  async (i, { prompt, num_images }) => {
    const BITS_PRICE = BITS_PER_IMAGE * num_images;
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
      "luosiallen/latent-consistency-model:553803fd018b3cf875a8bc774c99da9b33f36647badfd88a6eec90d61c5f62fc",
      {
        input: {
          prompt,
          num_images,
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
