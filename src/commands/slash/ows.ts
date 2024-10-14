import db from "$lib/database/drizzle";
import { oneWordStory } from "$lib/database/drizzle/schema";
import command from "$lib/discord/commands/slash";

export default command(
  {
    desc: "Write a story one word at a time!",
    options: {},
  },
  async i => {
    const { guildId } = i;
    if (!guildId) return;
    await db.insert(oneWordStory).values({
      guildId,
    });
    await i.reply(
      'One word story started! Send a word to continue the story. Each person can only send one word at a time, and not twice in a row. The story will end when "the end." is written.',
    );
  },
);
