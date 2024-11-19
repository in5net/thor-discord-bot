import { createEmbed } from "$lib/embed";
import db, { and, contains, eq } from "$lib/database/drizzle";
import { issues } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { env } from "node:process";

export default command(
  {
    desc: "Update an issue",
    options: {
      issue: {
        type: "int",
        desc: "The name off the issue search for",
        async autocomplete(search, i) {
          const results = await db.query.issues.findMany({
            columns: {
              id: true,
              name: true,
            },
            where: and(
              i.user.id === env.OWNER_ID ?
                undefined
              : eq(issues.userId, i.user.id),
              contains(issues.name, search),
            ),
            orderBy: issues.name,
            limit: 5,
          });
          return results.map(({ id, name }) => ({ name, value: id }));
        },
      },
      type: {
        type: "choice",
        desc: "Type of issue",
        choices: issues.type.enumValues,
        optional: true,
      },
      desc: {
        type: "string",
        desc: "Description of the issue",
        optional: true,
      },
    },
  },
  async (i, { issue, type, desc }) => {
    const result = await db.query.issues.findFirst({
      columns: {
        name: true,
      },
      where: eq(issues.id, issue),
    });
    if (!result) return i.reply("Issue not found");

    await db
      .update(issues)
      .set({
        type,
        desc,
      })
      .where(
        and(
          eq(issues.id, issue),
          i.user.id === env.OWNER_ID ? undefined : eq(issues.userId, i.user.id),
        ),
      );

    return i.reply({
      embeds: [
        createEmbed()
          .setTitle("Issue updated")
          .setDescription(`#${issue}: ${result.name}`),
      ],
    });
  },
);
