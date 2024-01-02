import command from "discord/commands/text";
import { createHash } from "node:crypto";

export default command(
	{
		desc: "Calculates the MD5 hash of some text as hex",
		args: {
			input: {
				type: "text",
				desc: "What to hash",
			},
		},
		examples: ["mdeez5"],
	},
	({ args: { input } }) => createHash("md5").update(input).digest("hex"),
);
