import command from "$lib/discord/commands/text";
import { choice } from "@iz7n/std/random";

export default command(
  {
    aliases: ["coin", "flip"],
    desc: "Flip a coin",
    args: {},
  },
  () => choice(["Heads", "Tails"]),
);
