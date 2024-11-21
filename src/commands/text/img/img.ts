import { buildMessage } from "$lib/customsearch";
import command from "$lib/discord/commands/text";
import db from "$src/lib/database/drizzle";
import { imageSearches } from "$src/lib/database/schema";

export default command(
  {
    desc: "Google search for an image",
    args: {
      query: {
        type: "text",
        desc: "The image query",
      },
    },
  },
  async ({ message, args: { query } }) => {
    const reply = await buildMessage(query, 1);
    const msg = await message.reply(reply);

    await db.insert(imageSearches).values({
      messageId: msg.id,
      query,
      start: 1,
    });
  },
);
