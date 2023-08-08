import { getBits, subtractBits } from "$services/ai/shared";
import { ADMIN_IDS } from "$services/env";
import { replicate } from "$src/services/ai/replicate";
import command from "discord/commands/slash";
import { z } from "zod";

const NAME = "Stable Diffusion XL";
const BITS_PER_IMAGE = 4;

export default command(
	{
		desc: `Create images from a prompt using ${NAME} (costs ${BITS_PER_IMAGE} bits per image).`,
		options: {
			prompt: {
				type: "string",
				desc: "Prompt to generate",
			},
		},
	},
	async (i, { prompt }) => {
		const BITS_PRICE = BITS_PER_IMAGE;
		if (i.user.bot) return i.reply(`Bots cannot use ${NAME}`);
		if (!ADMIN_IDS.includes(i.user.id)) {
			const bits = await getBits(i.user.id);
			if (bits < BITS_PRICE)
				return i.reply(
					`You need ${BITS_PRICE - bits} more bits to use ${NAME}`,
				);
		}

		await i.reply(`Running ${NAME}...`);

		const outputs = await replicate.run(
			"stability-ai/sdxl:7ca7f0d3a51cd993449541539270971d38a24d9a0d42f073caf25190d41346d7",
			{
				input: {
					prompt,
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
