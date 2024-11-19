import db, { eq, and, isNotNull, lt, or, sql } from "$lib/database/drizzle";
import { files, fileTags } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { getFileUrl } from "$lib/files";
import { AttachmentBuilder } from "discord.js";
import { env } from "node:process";

const stickenFileName = "stick.png";

export default command(
  {
    desc: "Chicken!",
    options: {
      sticken: {
        desc: "Sticken!",
        type: "bool",
        optional: true,
      },
    },
  },
  async (i, { sticken }) => {
    await i.deferReply();
    if (sticken) {
      const url = `https://${env.FILES_DOMAIN}/chicken/${stickenFileName}`;
      return i.editReply(url);
    }
    const date = new Date();
    date.setMinutes(date.getMinutes() - 1);
    const [chicken] = await db
      .select({ id: files.id, name: files.name })
      .from(files)
      .fullJoin(fileTags, eq(files.id, fileTags.fileId))
      .where(
        and(
          eq(fileTags.name, "chicken"),
          or(lt(files.sentAt, date), isNotNull(files.sentAt)),
        ),
      )
      .orderBy(sql`random()`)
      .limit(1);
    if (!chicken) {
      return i.editReply("No chicken found!");
    }
    await db
      .update(files)
      .set({
        sentAt: new Date(),
      })
      .where(eq(files.id, chicken.id));

    const url = getFileUrl(chicken);
    if (chicken.name.endsWith(".mp3")) {
      return i.editReply({
        content: null,
        files: [new AttachmentBuilder(url)],
      });
    }
    return i.editReply(url);
  },
);
