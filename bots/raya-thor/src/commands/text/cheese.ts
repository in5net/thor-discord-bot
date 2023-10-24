import { incCount } from "$services/users";
import command from "discord/commands/text";
import { env } from "node:process";

export default command(
	{
		aliases: ["che", "cc"],
		desc: "Cheese cat",
		args: {},
	},
	async ({ message: { channel, author } }) => {
		await channel.send(`https://${env.FILES_DOMAIN}/discord/cheesecat.png`);
		await incCount(author.id, "cheese");
	},
);
