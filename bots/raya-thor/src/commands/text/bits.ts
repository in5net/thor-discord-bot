import { getBits, MAX_BITS } from "$services/ai/shared";
import { ADMIN_IDS } from "$services/env";
import command from "discord/commands/text";

export default command(
	{
		desc: "Get the number of Bits you have",
		args: {},
	},
	async ({ message }) => {
		const { author } = message;
		if (ADMIN_IDS.includes(author.id))
			return message.reply(`UNLIMITED 🔵 BITS!!!!`);
		const bits = await getBits(author.id);
		return message.reply(
			`You have ${bits}/${MAX_BITS} ${
				bits < 6 ? "🔴" : bits < MAX_BITS ? "🟢" : "🔵"
			} bits.${bits ? "" : " no bits?"}`,
		);
	},
);
