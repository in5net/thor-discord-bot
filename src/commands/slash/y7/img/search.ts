import db, { and, contains, eq, ne } from "$lib/database/drizzle";
import { files,  fileTags } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { pipe } from "@in5net/std/fn";
import { collect, pick } from "@in5net/std/iter";
import { env } from "node:process";

export default command(
  {
    desc: "Search for an image from yyyyyyy.info",
    options: {
      file_name: {
        type: "string",
        desc: "The file name to search for",
        async autocomplete(search) {
          const results = await db
            .select({ name: files.name })
            .from(files)
            .fullJoin(fileTags, eq(files.id, fileTags.fileId))
            .where(
              and(
                eq(fileTags.name, "y7"),
                contains(files.name, search),
                ne(files.ext, "gif"),
                eq(files.nsfw, false),
              ),
            )
            .orderBy(files.name)
            .limit(5);
          return pipe(results, pick("name"), collect);
        },
      },
    },
  },
  async (i, { file_name }) => {
    const url = `https://${env.FILES_DOMAIN}/y7/images/${file_name}`;
    return i.reply(url);
  },
);
