import { getBits, subtractBits } from "$services/ai/shared";
import { ADMIN_IDS } from "$services/env";
import { replicate } from "$src/services/ai/replicate";
import command from "discord/commands/slash";
import { z } from "zod";

const NAME = "Anything v4";
const BITS_PER_IMAGE = 1;

export default command(
	{
		desc: `Create an from a prompt using ${NAME} (costs ${BITS_PER_IMAGE} bits per image)`,
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
				type: "choice",
				desc: "Number of images to generate",
				choices: ["1", "4"],
				default: "1",
			},
		},
	},
	async (i, { prompt, negative_prompt, num_outputs }) => {
		const n = Number.parseInt(num_outputs);
		const BITS_PRICE = BITS_PER_IMAGE * n;
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
			"cjwbw/anything-v4.0:42a996d39a96aedc57b2e0aa8105dea39c9c89d9d266caf6bb4327a1c191b061",
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
