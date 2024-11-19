import { createEmbed } from "$lib/embed";
import db, { and, eq, isNotNull } from "$lib/database/drizzle";
import { issues } from "$lib/database//schema";
import command from "$lib/discord/commands/slash";

export default command(
  {
    desc: "List all issues",
    options: {
      type: {
        type: "choice",
        desc: "Type of issue",
        choices: issues.type.enumValues,
        optional: true,
      },
      closed: {
        type: "bool",
        desc: "Show closed issues",
        default: false,
      },
    },
  },
  async (i, { type, closed }) => {
    const results = await db.query.issues.findMany({
      columns: {
        id: true,
        name: true,
        type: true,
        desc: true,
      },
      where: and(
        type ? eq(issues.type, type) : undefined,
        closed ? isNotNull(issues.closedAt) : undefined,
      ),
      orderBy: issues.createdAt,
      limit: 5,
    });
    return i.reply({
      embeds: [
        createEmbed()
          .setTitle("Issues")
          .addFields(
            results.map(({ id, name, type, desc }) => ({
              name: `#${id} ${
                type === "bug" ? "🐛"
                : type === "feature" ? "✨"
                : "🔧"
              } ${name}`,
              value: desc,
            })),
          ),
      ],
    });
  },
);
