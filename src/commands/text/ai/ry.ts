import db, { eq, desc } from "$lib/database/drizzle";
import { channels, context } from "$lib/database/schema";
import command from "$lib/discord/commands/text";
import logger from "$src/lib/logger";
import { ttlCache } from "@iz7n/std/fn";
import ms from "ms";
import { readFile } from "node:fs/promises";

const relativeRootPath = "../../../..";

const systemPath = new URL(
  `${relativeRootPath}/chat-system.txt`,
  import.meta.url,
);
export const system = ttlCache(
  async () => readFile(systemPath, "utf8"),
  ms("10 min"),
);

const descPath = new URL(`${relativeRootPath}/chat-desc.txt`, import.meta.url);
export const description = ttlCache(
  async () => readFile(descPath, "utf8"),
  ms("10 min"),
);

const model = "llama.cpp";

export default command(
  {
    desc: "Talk to llama.cpp",
    optionalPrefix: true,
    botsAlwaysExecChannels: ["💣botwar🤖"],
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
    const { channelId, channel, guildId } = message;

    if (prompt === "CLEAR") {
      await db.delete(context).where(eq(context.channelId, channelId));
      return message.reply("Context cleared");
    }

    const previous = await db.query.context.findMany({
      columns: {
        question: true,
        answer: true,
      },
      orderBy: desc(context.createdAt),
      limit: 5,
    });

    logger.info(`Running ${model}...`);
    const start = performance.now();

    const handle = setInterval(() => {
      channel.sendTyping().catch(() => {});
    }, 3000);

    const response = await fetch("http://localhost:1277/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "",
        messages: [
          ...previous.flatMap(
            ({ question: q, answer: a }) =>
              [
                { role: "user", content: q },
                { role: "assistant", content: a },
              ] as const,
          ),
          { role: "user", content: prompt },
        ],
        system: await system(),
        temperature: 0.9,
        max_tokens: 1024,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        stop_sequences: [
          "<|im_start",
          "<|im_end",
          "|im_start",
          "|im_end",
          "Q:",
          "A:",
        ],
      }),
    }).catch(() => {});
    clearInterval(handle);
    if (!response) {
      return;
    }

    const result = await response.json();

    const text = String(result.choices[0].message.content);

    await message.reply(text);

    const end = performance.now();
    const diff = end - start;
    logger.info(`${model} finished in ${(diff / 1000).toFixed(1)}s`);

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
      answer: text,
    });
  },
);
