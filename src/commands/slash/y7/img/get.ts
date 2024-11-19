import db, { ne, eq, and, sql } from "$lib/database/drizzle";
import { files, fileTags } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { env } from "node:process";

export default command(
  {
    desc: "Get a random image from yyyyyyy.info",
    options: {},
  },
  async i => {
    const [image] = await db
      .select({ name: files.name })
      .from(files)
      .fullJoin(fileTags, eq(files.id, fileTags.fileId))
      .where(and(eq(fileTags.name, "y7"), ne(files.ext, "gif")))
      .orderBy(sql`random()`)
      .limit(1);
    if (!image) {
      return i.reply("No image found");
    }

    const url = `https://${env.FILES_DOMAIN}/y7/images/${image.name}`;
    return i.reply(url);
  },
);
