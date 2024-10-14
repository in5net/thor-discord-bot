import command from "$lib/discord/commands/slash";

export default command(
  {
    desc: "Sends what you say",
    options: {
      message: {
        type: "string",
        desc: "What to say",
      },
    },
  },
  async (i, { message }) => {
    await i.deferReply();
    await i.channel?.send(message);
    await i.deleteReply();
  },
);
