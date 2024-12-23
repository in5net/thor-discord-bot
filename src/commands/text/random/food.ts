import db, { eq, sql } from "$lib/database/drizzle";
import { files, fileTags } from "$lib/database/schema";
import command from "$lib/discord/commands/text";
import { getFileUrl } from "$lib/files";

export default command(
  {
    desc: "Get a random gif of rotating food",
    args: {},
  },
  async ({ message }) => {
    const [food] = await db
      .select({ id: files.id, name: files.name })
      .from(files)
      .innerJoin(fileTags, eq(files.id, fileTags.fileId))
      .where(eq(fileTags.name, "rotating_food"))
      .orderBy(sql`random()`)
      .limit(1);
    if (!food) {
      return message.reply("No food found");
    }

    const url = getFileUrl(food);
    return message.reply(url);
  },
);
