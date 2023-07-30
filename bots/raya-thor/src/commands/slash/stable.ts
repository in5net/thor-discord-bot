import command from "discord/commands/slash";
import { generate } from "$services/ai/replicate/stable";
import { getBits, subtractBits } from "$services/ai/shared";
import { ADMIN_IDS } from "$services/env";

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
		if (i.user.bot) return i.reply(`Bots cannot use ${NAME}`);
		if (!ADMIN_IDS.includes(i.user.id)) {
			const bits = await getBits(i.user.id);
			if (bits < BITS_PRICE)
				return i.reply(
					`You need ${BITS_PRICE - bits} more bits to use ${NAME}`,
				);
		}

		await i.reply(`Running ${NAME}...`);

		for await (const { outputs, status, error } of generate(prompt, {
			negative_prompt,
			num_outputs,
		})) {
			if (error) return i.followUp(`Error: ${error}`);
			if (outputs)
				await i.editReply({
					content: `**${prompt}**
${outputs.join(" ")}`,
				});
			else
				switch (status) {
					case "failed": {
						return i.followUp(`${NAME} failed to generate images`);
					}

					case "canceled": {
						return i.followUp(`${NAME} was canceled`);
					}
				}
		}

		return subtractBits(i.user.id, BITS_PRICE);
	},
);
