import { choice } from "@in5net/std/random";
import command from "discord/commands/text";

export default command(
	{
		desc: "Flip a coin",
		args: {},
	},
	() => choice(["Heads", "Tails"]),
);
