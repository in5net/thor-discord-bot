import { incCount } from "$lib/users";
import command from "discord/commands/text";
import { env } from "node:process";

export default command(
	{
		aliases: ["che", "cc"],
		desc: "Cheese cat",
		args: {},
	},
	async ({ message: { author } }) => {
		await incCount(author.id, "cheese");
		return `https://${env.FILES_DOMAIN}/discord/cheesecat.png`;
	},
);
