import command from "discord/commands/slash";

export default command(
	{
		desc: "Ping!",
		options: {},
	},
	async i => i.reply(`Pong! ${Date.now() - i.createdTimestamp} ms`),
);
