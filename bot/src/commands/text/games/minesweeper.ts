import command from "discord/commands/text";

export default command(
	{
		aliases: ["ms"],
		desc: "Play some Minesweeper!",
		args: {},
	},
	async () => {
		const { default: Minesweeper } = await import("discord.js-minesweeper");
		const ms = new Minesweeper();
		return ms.start();
	},
);
