import { choice } from "@iz7n/std/random";
import command from "$lib/discord/commands/text";

export default command(
  {
    aliases: ["coin", "flip"],
    desc: "Flip a coin",
    args: {},
  },
  () => choice(["Heads", "Tails"]),
);
