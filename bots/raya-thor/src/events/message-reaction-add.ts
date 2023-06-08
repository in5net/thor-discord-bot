import { env } from "node:process";
import event from "discord/event";

export default event(
	{ name: "messageReactionAdd" },
	async ({ args: [reaction, user] }) => {
		if (user.id === env.OWNER_ID) await reaction.message.react(reaction.emoji);
	}
);
