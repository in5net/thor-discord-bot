import db, { sql, eq } from "$lib/database/drizzle";
import command from "$lib/discord/commands/text";
import { files, fileTags } from "$lib/database/schema";
import { getFileUrl } from "$lib/files";

export default command(
  {
    desc: "Get a random video of boss",
    args: {},
  },
  async ({ message }) => {
    const [file] = await db
      .select({ id: files.id, name: files.name })
      .from(files)
      .fullJoin(fileTags, eq(files.id, fileTags.fileId))
      .where(eq(fileTags.name, "boss"))
      .orderBy(sql`random()`)
      .limit(1);
    if (!file) {
      return message.reply("No boss file found");
    }

    const url = getFileUrl(file);
    return message.reply(url);
  },
);
