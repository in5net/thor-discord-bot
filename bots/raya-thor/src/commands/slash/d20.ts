import command from "discord/commands/slash";

export default command(
	{
		desc: "Roll a d20",
		options: {},
	},
	async i => {
		const n = Math.floor(Math.random() * 20 + 1);
		return i.reply(n.toString());
	},
);
