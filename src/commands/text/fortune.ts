import command from "$lib/discord/commands/text";
import got from "got";
import { z } from "zod";

const dataSchema = z.object({
  fortune: z.string(),
});

export default command(
  {
    desc: "Get a random fortune cookie",
    args: {},
  },
  async () => {
    const data = await got("http://yerkee.com/api/fortune").json();
    const { fortune } = dataSchema.parse(data);
    return fortune;
  },
);
