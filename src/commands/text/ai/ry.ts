import db, { eq, desc } from "$lib/database/drizzle";
import { channels, context } from "$lib/database/schema";
import command from "$lib/discord/commands/text";
import logger from "$src/lib/logger";
import { openai, system } from "./shared";
import { generateText } from "ai";

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

    const settings = {
      model: openai.chat(""),
      system: await system(),
      temperature: 0.9,
      maxTokens: 1024,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5,
      stopSequences: [
        "<|im_start",
        "<|im_end",
        "|im_start",
        "|im_end",
        "Q:",
        "A:",
      ],
    };

    const handle = setInterval(() => {
      channel.sendTyping().catch(() => {});
    }, 3000);

    const result = await generateText({
      ...settings,
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
    });

    clearInterval(handle);

    await message.reply(result.text);

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
      answer: result.text,
    });
  },
);
