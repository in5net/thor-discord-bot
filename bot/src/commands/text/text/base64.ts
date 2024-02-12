import command from "discord/commands/text";

export default command(
	{
		desc: "Encodes text in base 64",
		args: {
			input: {
				type: "text",
				desc: "What to encode",
			},
		},
		examples: ["hello world"],
	},
	({ args: { input } }) => btoa(input),
);
