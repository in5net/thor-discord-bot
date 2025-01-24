import db, { and, eq, sql } from "$lib/database/drizzle";
import { files, fileTags } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { getFileUrl } from "$lib/files";

export default command(
  {
    desc: "Sends a speech bubble",
    options: {},
  },
  async i => {
    await i.deferReply();
    const [quote] = await db
      .select({ id: files.id, name: files.name })
      .from(files)
      .innerJoin(fileTags, eq(files.id, fileTags.fileId))
      .where(and(eq(fileTags.name, "quote")))
      .orderBy(sql`random()`)
      .limit(1);
    if (!quote) {
      return i.editReply("No quote found");
    }
    await i.deleteReply();

    await i.channel?.send(getFileUrl(quote));
  },
);
