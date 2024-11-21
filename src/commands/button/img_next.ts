/* eslint-disable unicorn/filename-case */
import { buildMessage } from "$lib/customsearch";
import db, { eq } from "$lib/database/drizzle";
import { imageSearches } from "$lib/database/schema";
import handleButton from "$lib/discord/commands/button";

export default handleButton(async i => {
  await i.deferUpdate();

  const where = eq(imageSearches.messageId, i.message.id);
  const search = await db.query.imageSearches.findFirst({
    columns: {
      query: true,
      start: true,
    },
    where,
  });
  if (!search) {
    throw new Error(
      "Somehow this image search was not recorded in my database, so I have no idea what your search query is",
    );
  }

  const reply = await buildMessage("cheese", search.start + 1);

  await db
    .update(imageSearches)
    .set({ start: search.start + 1 })
    .where(where);

  await i.editReply(reply);
});
