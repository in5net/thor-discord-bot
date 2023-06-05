import process from "node:process";
import event from "$services/event";

export default event(
	{ name: "messageReactionAdd" },
	async ({ args: [reaction, user] }) => {
		if (user.id === process.env.OWNER_ID)
			await reaction.message.react(reaction.emoji);
	}
);
