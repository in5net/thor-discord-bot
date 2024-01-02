import command from "discord/commands/text";

export default command(
	{
		desc: "Puts a clap between every word",
		args: {
			text: {
				type: "text",
				desc: "The text to clapify",
			},
		},
		examples: ["there is just no way"],
	},
	({ args: { text } }) => text.split(" ").join(" 👏 "),
);
