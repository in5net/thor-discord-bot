import { buildMessage } from "$lib/customsearch";
import db from "$lib/database/drizzle";
import { imageSearches } from "$lib/database/schema";
import command from "$lib/discord/commands/text";

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
