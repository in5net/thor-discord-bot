import command from "$lib/discord/commands/text";
import owofire from "owofire";

export default command(
  {
    desc: "Owoifies a message",
    args: {
      message: {
        type: "text",
        desc: "The message to owoify",
      },
    },
    examples: ["I love lean!!"],
  },
  ({ args: { message } }) => owofire(message),
);
