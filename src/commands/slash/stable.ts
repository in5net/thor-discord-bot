import { replicate } from "$lib/ai/replicate";
import { getBits, subtractBits } from "$lib/ai/shared";
import db, { eq } from "$lib/database/drizzle";
import { users } from "$lib/database/drizzle/schema";
import command from "$lib/discord/commands/slash";
import { z } from "zod";

const NAME = "Stable Diffusion";
const BITS_PER_IMAGE = 2;

export default command(
  {
    desc: `Create images from a prompt using ${NAME} (costs ${BITS_PER_IMAGE} bits per image).`,
    options: {
      prompt: {
        type: "string",
        desc: "Prompt to generate",
      },
      negative_prompt: {
        type: "string",
        desc: "Negative prompt to generate",
        optional: true,
      },
      num_outputs: {
        type: "int",
        desc: "Number of images to generate",
        min: 1,
        max: 4,
        default: 1,
      },
    },
  },
  async (i, { prompt, negative_prompt, num_outputs }) => {
    const BITS_PRICE = BITS_PER_IMAGE * num_outputs;
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
      "stability-ai/stable-diffusion:b3d14e1cd1f9470bbb0bb68cac48e5f483e5be309551992cc33dc30654a82bb7",
      {
        input: {
          prompt,
          negative_prompt,
          num_outputs,
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
