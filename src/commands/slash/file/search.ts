import db, { eq, contains } from "$lib/database/drizzle";
import { attachments } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { sendFile } from "./shared";

export default command(
  {
    desc: "Search for a file",
    options: {
      file: {
        type: "string",
        desc: "The file name to search for",
        async autocomplete(search) {
          const results = await db.query.attachments.findMany({
            columns: {
              id: true,
              filename: true,
            },
            where: contains(attachments.filename, search),
            orderBy: attachments.filename,
            limit: 5,
          });
          return results.map(({ id, filename }) => ({
            name: filename,
            value: id,
          }));
        },
      },
    },
  },
  async (i, { file }) => {
    const fileData = await db.query.attachments.findFirst({
      where: eq(attachments.id, file),
    });
    if (!fileData) {
      return i.reply("No file found");
    }
    return sendFile(i, fileData);
  },
);
