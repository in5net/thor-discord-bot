import { replicate } from "$lib/ai/replicate";
import { getBits, subtractBits } from "$lib/ai/shared";
import db, { eq } from "database/drizzle";
import { users } from "database/drizzle/schema";
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
			num_outputs: {
				type: "int",
				desc: "Number of images to generate",
				min: 1,
				max: 4,
				default: 1,
			},
		},
	},
	async (i, { prompt, num_outputs }) => {
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
			"stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
			{
				input: {
					prompt,
					scheduler: "KarrasDPM",
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
