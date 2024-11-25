import command from "$lib/discord/commands/text";
import { generatePlanFromQuery } from "$src/music/plan";

export default command(
  {
    desc: "See what order things are going to be loaded in before -play is used",
    args: {
      query: {
        name: "query",
        type: "text",
        desc: "The URLs or YouTube searches to play",
        optional: true,
      },
    },
    examples: ["https://youtu.be/dQw4w9WgXcQ terraria ost"],
  },
  async ({ message, args: { query } }) => {
    const { plan, time } = await generatePlanFromQuery(message, query);
    return `${plan
      .map(({ query, name }, i) => `${i + 1}. ${name}: ${query}`)
      .join("\n")}
Plan time: ${time.toPrecision(2)}ms`;
  },
);
