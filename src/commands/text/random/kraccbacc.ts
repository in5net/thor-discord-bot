import db, { eq, and, isNotNull, lt, sql, or } from "$lib/database/drizzle";
import { files, fileTags } from "$lib/database/schema";
import command from "$lib/discord/commands/text";
import { getFileUrl } from "$lib/files";

export default command(
  {
    desc: "Sends a random kraccbacc video",
    args: {},
  },
  async ({ message }) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 1);
    const [video] = await db
      .select({ id: files.id, name: files.name })
      .from(files)
      .fullJoin(fileTags, eq(files.id, fileTags.fileId))
      .where(
        and(
          eq(fileTags.name, "kraccbacc"),
          or(lt(files.sentAt, date), isNotNull(files.sentAt)),
        ),
      )
      .orderBy(sql`random()`)
      .limit(1);
    if (!video) {
      return message.reply("No video found!");
    }
    await db
      .update(files)
      .set({
        sentAt: new Date(),
      })
      .where(eq(files.id, video.id));

    const url = getFileUrl(video);
    return message.reply(url);
  },
);
