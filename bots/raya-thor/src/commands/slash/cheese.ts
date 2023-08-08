import { incCount } from "$services/users";
import command from "discord/commands/slash";
import { env } from "node:process";

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
