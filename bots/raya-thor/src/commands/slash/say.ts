import command from "discord/commands/slash";

export default command(
	{
		desc: "Literally just says what you send",
		options: {
			message: {
				type: "string",
				desc: "The message to send",
				max: 2000,
			},
		},
	},
	async (i, { message }) => {
		await i.deferReply();
		await i.deleteReply();
		await i.channel?.send(message);
	},
);
