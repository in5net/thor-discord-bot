import db, { eq } from "$lib/database/drizzle";
import { files, fileTags, users } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { prepareTaggedFile } from "$lib/files";
import logger from "$lib/logger";
import got from "got";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

export default command(
  {
    desc: "Add a chicken",
    options: {
      file: {
        type: "attachment",
        desc: "The file to add",
      },
    },
  },
  async (i, { file: { name, proxyURL } }) => {
    const user = await db.query.users.findFirst({
      columns: {
        admin: true,
      },
      where: eq(users.id, i.user.id),
    });
    if (!user?.admin) {
      return i.reply("You are not an admin");
    }

    const { id, path, subPath, ext, url } = await prepareTaggedFile(name);
    const request = got.stream(proxyURL);
    await pipeline(request, createWriteStream(path));

    await db.transaction(async tx => {
      await tx.insert(files).values({
        id,
        path: subPath,
        name,
        ext,
      });
      await tx.insert(fileTags).values({
        fileId: id,
        name: "chicken",
      });
    });

    logger.info(`Uploaded ${url}`);

    return i.reply(`Chicken added
${url}`);
  },
);
