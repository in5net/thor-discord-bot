import { choice } from "@in5net/std/random";
import command from "discord/commands/text";

export default command(
	{
		aliases: ["coin", "flip"],
		desc: "Flip a coin",
		args: {},
	},
	() => choice(["Heads", "Tails"]),
);
