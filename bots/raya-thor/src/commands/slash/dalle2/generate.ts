import { getBits, subtractBits } from "$services/ai/shared";
import { ADMIN_IDS } from "$services/env";
import { openai } from "$services/openai";
import { type ResponseTypes } from "@nick.heiner/openai-edge";
import command from "discord/commands/slash";
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
		if (!ADMIN_IDS.includes(i.user.id)) {
			const bits = await getBits(i.user.id);
			if (bits < cost)
				return i.reply(`You need ${cost - bits} more bits to do this`);
		}

		await i.deferReply();

		const response = await openai.createImage({
			prompt,
			n,
			size: "1024x1024",
			user: i.user.id,
		});
		const { data } = (await response.json()) as ResponseTypes["createImage"];

		await i.editReply({
			content: prompt,
			files: data.map(({ url = "" }) => url),
		});
		return subtractBits(i.user.id, cost);
	},
);
