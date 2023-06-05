import command from "$commands/slash";

export default command(
	{
		desc: "Ping!",
		options: {},
	},
	async i => i.reply(`Pong! ${Date.now() - i.createdTimestamp} ms`)
);
