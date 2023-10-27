import command from "discord/commands/text";

export default command(
	{
		desc: "Literally just says what you send",
		args: {
			msg: {
				type: "text",
				desc: "The message to send",
			},
		},
	},
	async ({ message, args: { msg } }) => {
		await message.delete();
		return msg;
	},
);
