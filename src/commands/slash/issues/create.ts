import db, { eq } from "$lib/database/drizzle";
import { issues, users } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import { createEmbed } from "$lib/embed";

export default command(
  {
    desc: "Create an issue",
    options: {
      name: {
        type: "string",
        desc: "Name of the issue",
      },
      type: {
        type: "choice",
        desc: "Type of issue",
        choices: ["bug", "feature", "enhancement"],
      },
      desc: {
        type: "string",
        desc: "Description of the issue",
      },
    },
  },
  async (i, { name, type, desc }) => {
    const userExists = !!(await db.query.users.findFirst({
      where: eq(users.id, i.user.id),
    }));
    if (!userExists) {
      await db.insert(users).values({
        id: i.user.id,
      });
    }

    const [{ id } = { id: "" }] = await db
      .insert(issues)
      .values({
        userId: i.user.id,
        name,
        type,
        desc,
      })
      .returning({ id: issues.id });
    const embed = createEmbed()
      .setTitle(`#${id} ${name}`)
      .setDescription(desc)
      .addFields({
        name: "Type",
        value: `${
          type === "bug" ? "🐛"
          : type === "feature" ? "✨"
          : "🔧"
        } ${type}`,
      });
    return i.reply({
      embeds: [embed],
    });
  },
);
