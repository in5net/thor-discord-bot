import db, { eq, gte, and, desc } from "$lib/database/drizzle";
import { channels, context } from "$lib/database//schema";
import command from "$lib/discord/commands/text";
import { filter, openai } from "$lib/openai";
import { ttlCache } from "@in5net/std/fn";
import ms from "ms";
import { readFile } from "node:fs/promises";
import { env } from "node:process";

const gpt3DescPath = new URL("../../../../gpt3-desc.txt", import.meta.url);
const description = ttlCache(
  async () => readFile(gpt3DescPath, "utf8"),
  ms("10 min"),
);

export default command(
  {
    desc: "Talk to GPT-3.5",
    optionalPrefix: true,
    args: {
      prompt: {
        type: "text",
        desc: "The prompt to send",
        max: 512,
      },
    },
    examples: ["do you love lean?", "what's 77 + 33?"],
  },
  async ({ message, args: { prompt } }) => {
    const { channelId, channel, author, guildId } = message;

    if (prompt === "CLEAR") {
      await db.delete(channels).where(eq(channels.id, channelId));
      return message.reply("Context cleared");
    }

    if (!(await filter(prompt))) {
      return message.reply("Your text did not pass the content filter");
    }

    const minCreatedAt = new Date();
    minCreatedAt.setMinutes(minCreatedAt.getMinutes() - 5);
    const previous = await db.query.context.findMany({
      columns: {
        question: true,
        answer: true,
      },
      where: and(
        gte(context.createdAt, minCreatedAt),
        eq(context.channelId, channelId),
      ),
      orderBy: desc(context.createdAt),
    });

    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `${await description()} Current time: ${new Date().toLocaleString()}

${previous.map(
  ({ question: q, answer: a }) => `You: ${q}
${env.NAME}: ${a}
`,
)}
You: ${prompt}
${env.NAME}:`,
      temperature: 0.9,
      max_tokens: 1024,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      stop: ["You:"],
      user: author.id,
    });
    const reply = response.choices?.[0]?.text || "";
    await message.channel.send(reply);

    const channelExists = await db.query.channels.findFirst({
      columns: {
        id: true,
      },
      where: eq(channels.id, channelId),
    });
    if (!channelExists) {
      await db.insert(channels).values({
        id: channelId,
        guildId: guildId || "",
        nsfw: "nsfw" in channel ? channel.nsfw : false,
      });
    }

    return db.insert(context).values({
      channelId,
      question: prompt,
      answer: reply,
    });
  },
);
