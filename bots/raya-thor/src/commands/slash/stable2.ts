import { getBits, subtractBits } from "$services/ai/shared";
import { replicate } from "$src/services/ai/replicate";
import db, { eq } from "database/drizzle";
import { users } from "database/drizzle/schema";
import command from "discord/commands/slash";
import { z } from "zod";

const NAME = "Stable Diffusion 2";
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

		const user = await db.query.users.findFirst({
			columns: {
				admin: true,
			},
			where: eq(users.id, i.user.id),
		});
		if (!user?.admin) {
			const bits = await getBits(i.user.id);
			if (bits < BITS_PRICE)
				return i.reply(
					`You need ${BITS_PRICE - bits} more bits to use ${NAME}`,
				);
		}

		await i.reply(`Running ${NAME}...`);

		const outputs = await replicate.run(
			"stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
			{
				input: {
					prompt,
					negative_prompt,
					num_outputs,
					width: 512,
					height: 512,
					prompt_strength: 0.8,
					num_inference_steps: 50,
					guidance_scale: 7.5,
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
