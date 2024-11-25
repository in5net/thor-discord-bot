import musicCommand from "./command";

export default musicCommand(
  {
    desc: 'Joins the voice channel for ~10 min being all like "ight, ill hang for a bit"',
    args: {},
    permissions: ["vc"],
  },
  async ({ message, voice }) => {
    voice.setChannels(message);
    // eslint-disable-next-line unicorn/require-array-join-separator
    await voice.stream.join();
    if (voice.queue.length) {
      await voice.play();
    }
  },
);
