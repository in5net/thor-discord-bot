import command from "$lib/discord/commands/slash";
import { getRandomFile, sendFile } from "./shared";

export default command(
  {
    desc: "Get a random video",
    options: {},
  },
  async i => {
    const file = await getRandomFile("video");
    if (!file) {
      return i.reply("No file found");
    }
    return sendFile(i, file);
  },
);
