import db, { eq, sql, and, not } from "$lib/database/drizzle";
import { files, fileTags } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { env } from "node:process";

export default command(
  {
    desc: "Get a random gif from yyyyyyy.info",
    options: {},
  },
  async i => {
    const [gif] = await db
      .select({ name: files.name })
      .from(files)
      .innerJoin(fileTags, eq(files.id, fileTags.fileId))
      .where(
        and(eq(fileTags.name, "y7"), eq(files.ext, ".gif"), not(files.nsfw)),
      )
      .orderBy(sql`random()`)
      .limit(1);
    if (!gif) {
      return i.reply("No image found");
    }

    const url = `https://${env.FILES_DOMAIN}/y7/images/${gif.name}`;
    return i.reply(url);
  },
);
