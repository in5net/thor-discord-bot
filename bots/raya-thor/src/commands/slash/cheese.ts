import { env } from "node:process";
import command from "discord/commands/slash";
import { incCount } from "$services/users";

export default command(
	{
		desc: "Cheese cat",
		options: {},
	},
	async i => {
		await i.deferReply();
		await i.deleteReply();
		await i.channel?.send(`https://${env.FILES_DOMAIN}/discord/cheesecat.png`);
		await incCount(i.user.id, "cheese");
	},
);
