import command from "discord/commands/text";
import { createHash } from "node:crypto";

export default command(
	{
		desc: "Calculates the SHA-256 hash of some text as hex",
		args: {
			input: {
				type: "text",
				desc: "What to hash",
			},
		},
		examples: ["shat"],
	},
	({ args: { input } }) => createHash("sha256").update(input).digest("hex"),
);
