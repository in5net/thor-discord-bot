import db, { sql } from "$lib/database/drizzle";
import command from "$lib/discord/commands/slash";
import { incCount } from "$lib/users";
import { shuffle } from "@in5net/std/random";

const NUM_RATIOS = 50;

export default command(
  {
    desc: "Get ratioed",
    options: {},
  },
  async i => {
    await i.deferReply();
    await i.deleteReply();
    const ratios = await db.query.ratios.findMany({
      columns: {
        content: true,
      },
      orderBy: sql`random()`,
      limit: NUM_RATIOS,
    });
    const texts = shuffle(ratios.map(({ content }) => content));
    await i.channel?.send(
      texts.join(" + ") ||
        "Looks like there are no ratios, use `/ratio add` to add some",
    );
    await incCount(i.user.id, "ratio");
  },
);
