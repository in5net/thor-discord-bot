import musicCommand from "./command";

export default musicCommand(
  {
    aliases: ["p", "ballsack", "bs"],
    desc: "Plays a song by name or URL",
    args: {
      query: {
        name: "query",
        type: "text",
        desc: "The URLs or YouTube searches to play",
        optional: true,
      },
    },
    permissions: ["vc"],
    examples: ["https://youtu.be/dQw4w9WgXcQ terraria ost"],
  },
  async ({ message, args: { query }, voice }) => voice.add(message, query),
);
