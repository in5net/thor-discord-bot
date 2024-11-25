import db, { and, desc, eq, gte } from "$lib/database/drizzle";
import { channels, context } from "$lib/database/schema";
import command from "$lib/discord/commands/text";
import { filter } from "$lib/openai";
import { openai } from "@ai-sdk/openai";
import { throttle } from "@iz7n/std/async";
import { ttlCache } from "@iz7n/std/fn";
import { streamText } from "ai";
import { type Message } from "discord.js";
import ms from "ms";
import { readFile } from "node:fs/promises";

const chatGPTSystemPath = new URL(
  "../../../../chatgpt-system.txt",
  import.meta.url,
);
const chatGPTDescPath = new URL(
  "../../../../chatgpt-desc.txt",
  import.meta.url,
);
const system = ttlCache(
  async () => readFile(chatGPTSystemPath, "utf8"),
  ms("10 min"),
);
const description = ttlCache(
  async () => readFile(chatGPTDescPath, "utf8"),
  ms("10 min"),
);

export default command(
  {
    desc: "Talk to ChatGPT",
    optionalPrefix: true,
    args: {
      prompt: {
        type: "text",
        desc: "The prompt to send",
        max: 256,
      },
    },
    examples: ["hi", "what is the meaning of life?"],
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

    let reply = "";
    let responseMessage: Message | undefined;
    const send = throttle(async () => {
      if (reply) {
        if (responseMessage) {
          await responseMessage.edit(reply);
        } else {
          responseMessage = await channel.send(reply);
        }
      }
    }, 500);
    const result = streamText({
      model: openai.chat("gpt-3.5-turbo-0125", {
        user: author.id,
      }),
      maxTokens: 1024,
      system: `${await system()} Current date: ${new Date().toDateString()}`,
      messages: [
        {
          role: "assistant",
          content: await description(),
        },
        ...previous.flatMap(
          ({ question: q, answer: a }) =>
            [
              { role: "user", content: q },
              { role: "assistant", content: a },
            ] as const,
        ),
        { role: "user", content: prompt },
      ],
    });
    for await (const textPart of result.textStream) {
      reply += textPart;
      send();
    }

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
