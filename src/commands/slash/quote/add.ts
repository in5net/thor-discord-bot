import db, { eq } from "$lib/database/drizzle";
import { files, fileTags, users } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import logger from "$lib/logger";
import { prepareTaggedFile } from "$lib/files";
import got from "got";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

export default command(
  {
    desc: "Add a speech bubble",
    options: {
      image: {
        type: "attachment",
        desc: "The image to add",
      },
    },
  },
  async (i, { image: { name, proxyURL } }) => {
    const user = await db.query.users.findFirst({
      columns: {
        admin: true,
      },
      where: eq(users.id, i.user.id),
    });
    if (!user?.admin) {
      return i.reply("You are not an admin");
    }

    const { id, path, ext, url } = await prepareTaggedFile(name);
    const request = got.stream(proxyURL);
    await pipeline(request, createWriteStream(path));

    await db.transaction(async tx => {
      await tx.insert(files).values({
        id,
        name,
        ext,
      });
      await tx.insert(fileTags).values({
        fileId: id,
        name: "quote",
      });
    });

    logger.info(`Uploaded ${url}`);

    return i.reply(`Quote added
${url}`);
  },
);
