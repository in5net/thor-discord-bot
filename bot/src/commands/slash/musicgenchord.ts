import { replicate } from "$lib/ai/replicate";
import { getBits, subtractBits } from "$lib/ai/shared";
import db, { eq } from "database/drizzle";
import { users } from "database/drizzle/schema";
import command from "discord/commands/slash";
import { env } from "node:process";
import { z } from "zod";

const NAME = "MusicGen-Chord";
const COST = 2;

export default command(
	{
		desc: `Create music from a prompt using ${NAME} (costs ${COST} bits).`,
		options: {
			prompt: {
				type: "string",
				desc: "Prompt to generate",
			},
			text_chords: {
				type: "string",
				desc: "Chords to use",
			},
			bpm: {
				type: "int",
				desc: "Beats per minute",
				min: 20,
				max: 256,
				default: 120,
			},
			time_sig: {
				type: "string",
				desc: "Time signature (e.g. 4/4)",
				default: "4/4",
			},
		},
	},
	async (i, { prompt, text_chords, bpm, time_sig }) => {
		const BITS_PRICE = COST;
		if (i.user.bot) return i.reply(`Bots cannot use ${NAME}`);

		if (env.NODE_ENV === "production") {
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
		}

		await i.deferReply();

		const output = await replicate.run(
			"sakemin/musicgen-chord:c940ab4308578237484f90f010b2b3871bf64008e95f26f4d567529ad019a3d6",
			{
				input: {
					bpm,
					top_k: 250,
					top_p: 0,
					prompt,
					duration: 12,
					time_sig,
					audio_start: 0,
					temperature: 1,
					text_chords,
					continuation: false,
					output_format: "wav",
					chroma_coefficient: 1,
					multi_band_diffusion: true,
					normalization_strategy: "loudness",
					classifier_free_guidance: 3,
				},
				wait: {
					interval: 5000,
				},
			},
			async prediction => {
				switch (prediction.status) {
					case "starting": {
						await i.editReply({
							content: `${NAME}
**${prompt}**
Starting...`,
						});
						break;
					}

					case "processing": {
						await i.editReply({
							content: `${NAME}
**${prompt}**
Processing... ${prediction.logs
								?.trimEnd()
								.split("\n")
								.at(-1)
								?.replaceAll(" ", "")}`,
						});
					}
				}
			},
		);
		const url = z.string().parse(output);

		await i.editReply({
			content: `${NAME}
**${prompt}**`,
			files: [url],
		});

		if (env.NODE_ENV === "production")
			await subtractBits(i.user.id, BITS_PRICE);
	},
);
