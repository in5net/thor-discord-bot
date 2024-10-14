import db, { eq } from "$lib/database/drizzle";
import { speechBubbles, users } from "$lib/database/drizzle/schema";
import command from "$lib/discord/commands/slash";
import logger from "$lib/logger";
import { filesBucket } from "$lib/storage";
import got from "got";
import { env } from "node:process";
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

    const request = got.stream(proxyURL);
    const path = `speech-bubbles/${name}`;
    const stream = filesBucket.file(path).createWriteStream({
      gzip: true,
    });
    await pipeline(request, stream);

    await db.insert(speechBubbles).values({
      name,
    });

    const fileURL = `https://${env.FILES_DOMAIN}/${path}`;
    logger.info(`Uploaded ${fileURL}`);

    return i.reply(`Quote added
${fileURL}`);
  },
);
