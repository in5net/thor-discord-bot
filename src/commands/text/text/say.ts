import command from "$lib/discord/commands/text";

export default command(
  {
    desc: "Literally just says what you send",
    args: {
      msg: {
        type: "text",
        desc: "The message to send",
      },
    },
    examples: ["wassup"],
  },
  async ({ message, args: { msg } }) => {
    await message.delete();
    return msg;
  },
);
