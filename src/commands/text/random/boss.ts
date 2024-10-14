import db, { sql } from "$lib/database/drizzle";
import command from "$lib/discord/commands/text";

export default command(
  {
    desc: "Get a random video of boss",
    args: {},
  },
  async ({ message }) => {
    const boss = await db.query.bossFiles.findFirst({
      columns: {
        url: true,
      },
      orderBy: sql`random()`,
    });
    if (!boss) {
      return message.reply("No boss found");
    }
    return message.reply(boss.url);
  },
);
