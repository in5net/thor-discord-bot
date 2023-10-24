import command from "discord/commands/text";

export default command(
	{
		desc: "Ping!",
		args: {},
	},
	async ({ message }) =>
		message.reply(`Pong! ${Date.now() - message.createdTimestamp} ms`),
);
