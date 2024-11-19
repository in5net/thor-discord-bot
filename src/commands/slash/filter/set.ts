import { getVoice } from "$src/music/voice-manager";
import { pipe } from "@in5net/std/fn";
import { collect, pick } from "@in5net/std/iter";
import db, { contains, eq } from "$lib/database/drizzle";
import { audioFilters } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";

export default command(
  {
    desc: "Add song filters",
    options: {
      filter: {
        type: "string",
        desc: "The filter to apply",
        async autocomplete(search) {
          const results = await db.query.audioFilters.findMany({
            columns: {
              name: true,
            },
            where: contains(audioFilters.name, search),
            orderBy: audioFilters.name,
            limit: 5,
          });
          return pipe(results, pick("name"), collect);
        },
      },
    },
  },
  async (i, { filter }) => {
    const { guildId } = i;
    if (!guildId) return;
    const voice = getVoice(guildId);

    const audioFilter = await db.query.audioFilters.findFirst({
      columns: {
        value: true,
      },
      where: eq(audioFilters.name, filter),
    });
    if (!audioFilter) return i.reply(`Filter \`${filter}\` not found`);

    await voice.setFilters([audioFilter.value]);
    return i.reply(`🎚️ Set filters to \`${filter}\``);
  },
);
