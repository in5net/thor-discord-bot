import db, { ne, sql } from "$lib/database/drizzle";
import command from "$lib/discord/commands/slash";
import { env } from "node:process";

export default command(
  {
    desc: "Get a random image from yyyyyyy.info",
    options: {},
  },
  async i => {
    const image = await db.query.y7Files.findFirst({
      columns: {
        name: true,
      },
      where: table => ne(table.extension, "gif"),
      orderBy: sql`random()`,
    });
    if (!image) return i.reply("No image found");

    const url = `https://${env.FILES_DOMAIN}/y7/images/${image.name}`;
    return i.reply(url);
  },
);
