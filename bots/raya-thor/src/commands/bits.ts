import command from "$commands/slash";
import { getBits, MAX_BITS } from "$services/ai/shared";
import { ADMIN_IDS } from "$services/env";

export default command(
	{
		desc: "Get the number of Bits you have",
		options: {},
	},
	async i => {
		if (ADMIN_IDS.includes(i.user.id)) return i.reply(`UNLIMITED 🔵 BITS!!!!`);
		const bits = await getBits(i.user.id);
		return i.reply(
			`You have ${bits}/${MAX_BITS} ${
				bits < 6 ? "🔴" : bits < MAX_BITS ? "🟢" : "🔵"
			} bits.${bits ? "" : " no bits?"}`
		);
	}
);
