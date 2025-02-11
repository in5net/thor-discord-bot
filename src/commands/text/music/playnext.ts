import musicCommand from "./command";

export default musicCommand(
  {
    aliases: ["pnx"],
    desc: "Adds a song url or YouTube search, and files if given, to the front of the queue",
    args: {
      queries: {
        type: "text",
        desc: "The URLs or YouTube searches to play",
        optional: true,
      },
    },
    permissions: ["vc"],
    examples: ["https://youtu.be/dQw4w9WgXcQ terraria ost"],
  },
  async ({ message, args: { queries }, voice }) => {
    await voice.add(message, queries);
    await voice.move(voice.queue.length - 1, voice.queue.currentIndex + 1);
  },
);
