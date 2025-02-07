import command from "$lib/discord/commands/text";
import { choice } from "@in5net/std/random";

export default command(
  {
    aliases: ["coin", "flip"],
    desc: "Flip a coin",
    args: {},
  },
  () => choice(["Heads", "Tails"]),
);
