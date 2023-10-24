import command from "discord/commands/text";

export default command(
	{
		desc: "Literally just says what you send",
		args: {
			message: {
				type: "text",
				desc: "The message to send",
			},
		},
	},
	async ({ args: { message } }) => message,
);
