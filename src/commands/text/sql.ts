import db from "$lib/database/playground";
import command from "$lib/discord/commands/text";

export default command(
  {
    desc: "Run some SQL in a plaground SQLite database",
    args: {
      sql: {
        type: "text",
        desc: "The SQL query",
      },
    },
  },
  async ({ message, args: { sql } }) => {
    const query = db.prepare(sql);
    if (sql.toLowerCase().startsWith("select")) {
      const rows = query.all();
      await message.channel.send(
        rows
          .map(row => JSON.stringify(row))
          .join("\n")
          .trim() || "*No rows returned*",
      );
    } else {
      query.run();
      await message.react("👍");
    }
  },
);
