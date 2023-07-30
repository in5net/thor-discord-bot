import { random } from "@in5net/limitless";
import command from "discord/commands/slash";

export default command(
	{
		desc: "Flip a coin",
		options: {},
	},
	async i => i.reply(random(["Heads", "Tails"])),
);
