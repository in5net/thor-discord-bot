import db, { desc, eq, count } from "$lib/database/drizzle";
import { stackItems } from "$lib/database//schema";
import command from "$lib/discord/commands/text";
import { time } from "discord.js";

export default command(
  {
    desc: "Removes the last an item from the stack",
    args: {},
  },
  async () => {
    const item = await db.query.stackItems.findFirst({
      columns: {
        id: true,
        createdAt: true,
        value: true,
      },
      orderBy: desc(stackItems.id),
    });
    if (!item) {
      return "Nothing was popped since the stack is empty";
    }
    await db.delete(stackItems).where(eq(stackItems.id, item.id));
    const [result] = await db.select({ count: count() }).from(stackItems);
    return `Item popped! New length: ${result?.count || 0}
Pushed at: ${time(item.createdAt)}
Value: ${item.value}`;
  },
);
