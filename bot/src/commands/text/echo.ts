import command from "discord/commands/text";

export default command(
	{
		desc: "Simply sends the input back",
		args: {
			input: {
				type: "text",
				desc: "The input to send back",
			},
		},
	},
	({ args: { input } }) => input,
);
