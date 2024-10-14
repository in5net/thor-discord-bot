import musicCommand from "./command";

export default musicCommand(
  {
    aliases: ["n", "skip"],
    desc: "Skips a song and plays the next one",
    args: {},
    permissions: ["vc"],
  },
  async ({ voice }) => voice.next(),
);
