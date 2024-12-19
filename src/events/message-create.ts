import {
  type Node,
  CommandError,
  getNodeRange,
  Lexer,
  Parser,
  stringifyNode,
} from "$lib/command";
import db, { and, desc, eq } from "$lib/database/drizzle";
import {
  commandExecutions,
  oneWordStory,
  oneWordStoryEntry,
  randomResponses,
} from "$lib/database/schema";
import type { ArgumentValue, TextCommand } from "$lib/discord/commands/text";
import event from "$lib/discord/event";
import { getCommandUsage } from "$lib/discord/help";
import { emojiRegex } from "$lib/emoji";
import logger from "$lib/logger";
import { incCount } from "$lib/users";
import { getRandomResponses, getThemes } from "$src/responses";
import { handleWordleMessage } from "../commands/text/games/wordle";
import { pipe } from "@iz7n/std/fn";
import { pick } from "@iz7n/std/iter";
import { choice, randomInt, shuffle } from "@iz7n/std/random";
import { sum } from "@iz7n/std/stats";
import * as deepl from "deepl-node";
import {
  type TextBasedChannel,
  EmbedBuilder,
  quote,
  userMention,
  type Message,
} from "discord.js";
import Fuse from "fuse.js";
import {
  anyOf,
  caseInsensitive,
  charIn,
  createRegExp,
  digit,
  exactly,
  global,
  letter,
  maybe,
  oneOrMore,
  whitespace,
} from "magic-regexp";
import { env } from "node:process";

const prefix = env.PREFIX;
const prefixRegex = createRegExp(exactly(prefix).times(1).at.lineStart(), [
  caseInsensitive,
]);
const whitespaceRegex = createRegExp(whitespace, [global]);

const responseVariableRegex = createRegExp(
  "{",
  oneOrMore(anyOf(letter, charIn("._"))).grouped(),
  "}",
  [global],
);

const translator = new deepl.Translator(env.DEEPL_API_KEY);

export default event(
  { name: "messageCreate" },
  async ({ client, args: [message] }) => {
    const { content, cleanContent, channel, author, reference } = message;
    if (!channel.isTextBased() || channel.isDMBased()) {
      return;
    }

    const lowercase = content.toLowerCase();
    const noWhitespace = lowercase.replaceAll(whitespaceRegex, "");
    if (
      !author.bot &&
      ["among", "imposter", "imposta", "amogus", "mongus"].some(str =>
        noWhitespace.includes(str),
      ) &&
      author.id !== client.user?.id
    ) {
      await incCount(author.id, "salad_mundus");
    } else {
      const [first = "", second = "", third = ""] = noWhitespace;
      if (emojiRegex.test(first) && second === "+" && emojiRegex.test(third)) {
        const { default: emojiMix } = await import("emoji-mixer");
        const url = emojiMix(first, third);
        await (url ?
          message.reply(url)
        : message.reply("no emoji mix found ):"));
      } else if (
        prefixRegex.test(content) ||
        client.textCommands.some(
          ({ optionalPrefix }, name) =>
            optionalPrefix && lowercase.startsWith(name),
        )
      ) {
        await handleTextCommand(message);
      }

      for (const textCommand of client.textCommands.values()) {
        if (
          textCommand.botsAlwaysExecChannels?.includes(channel.name) &&
          author.bot
        ) {
          // TODO: make this smarter, just a quick thing for now
          await textCommand.exec({
            message,
            args: { prompt: cleanContent },
            client,
          });
        }
      }

      if (author.bot) {
        return;
      }

      if ("name" in channel) {
        if (
          ["general", "thor", "slimevr"].some(name =>
            channel.name.includes(name),
          )
        ) {
          await handleRandomResponse(message);
        }

        if (channel.name === "one-word-story") {
          await handleOneWordStory(message);
        }
      }

      if (reference?.messageId && ["translate", "tl"].includes(lowercase)) {
        const referencedMessage = await channel.messages.fetch(
          reference.messageId,
        );
        const foreignContent = referencedMessage.cleanContent;
        const result = await translator.translateText(
          foreignContent,
          null,
          "en-US",
        );
        await channel.send(quote(result.text));
      }

      if (content.startsWith("tl ")) {
        const result = await translator.translateText(
          content.replace("tl ", ""),
          author.id === env.OWNER_ID ? "ja" : null,
          "en-US",
        );
        await channel.send(quote(result.text));
      }

      await handleHaiku(message);
    }
  },
);

async function handleTextCommand(message: Message<true>) {
  const { client, content, channel } = message;

  try {
    const ast = parseContent(content);

    for (const pipedCommands of ast.value) {
      let output: string | undefined;
      for (const commandNode of pipedCommands.value) {
        const { name, args } = commandNode.value;

        const trueArguments: Node[] = [name];
        if (output !== undefined) {
          trueArguments.push({
            type: "str",
            value: { type: "str", value: output, range: [0, 0] },
          });
        }
        trueArguments.push(...args);
        let command: TextCommand | undefined;
        const commandNames: string[] = [];
        let commandName = "";
        for (const arg of [name, ...args]) {
          if (arg.type === "ident") {
            const subcommandName = (arg as Node<"ident">).value.value;
            commandNames.push(subcommandName);
            const lowerArgument = subcommandName.toLowerCase();
            const subcommand = client.textCommands.find(
              // eslint-disable-next-line no-loop-func
              ({ aliases }, name) =>
                name.startsWith(commandName) &&
                (name === lowerArgument || aliases?.includes(lowerArgument)),
            );
            if (!subcommand) {
              break;
            }
            commandName = `${commandName} ${subcommandName}`.trimStart();
            trueArguments.shift();
            command = subcommand;
          }
        }

        const fullName = commandNames.join(" ");
        if (command) {
          if (
            command.permissions?.includes("vc") &&
            !message.member?.voice.channel
          ) {
            await message.reply(`You are not in a voice channel`);
          } else {
            const result = await runCommand(
              fullName,
              command,
              trueArguments,
              message,
            );
            output = typeof result === "string" ? result : undefined;
          }
        } else {
          const list = [...client.textCommands.entries()]
            .map(([name, command]) => ({ name, ...command }))
            .sort((a, b) => a.name.localeCompare(b.name));
          const fuse = new Fuse(list, {
            keys: ["name", "aliases"],
            threshold: 0.2,
          });
          const [suggestion] = fuse.search(fullName, { limit: 1 });
          if (suggestion) {
            await channel.send(
              `${
                Math.random() < 0.1 ? "No" : `IDK what \`${fullName}\` is`
              }. Did you mean \`${suggestion.item.name}\`${
                suggestion.item.aliases ?
                  `(${suggestion.item.aliases
                    .map(alias => `\`${alias}\``)
                    .join(", ")})`
                : ""
              }?`,
            );
          }
        }
      }
      if (typeof output === "string") {
        await message.channel.send(output);
      }
    }
  } catch (error) {
    await sendError(
      message.channel,
      error instanceof CommandError ?
        new TypeError(`\`\`\`${error.format(content)}\`\`\``, {
          cause: error,
        })
      : error,
    );
  }
}

/** @throws {CommandError} */
export function parseContent(content: string) {
  try {
    const lexer = new Lexer(content);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    return ast;
  } catch (error) {
    console.error(error);
    throw error instanceof CommandError ?
        new TypeError(`\`\`\`${error.format(content)}\`\`\``, {
          cause: error,
        })
      : error;
  }
}

export async function runCommand(
  name: string,
  command: TextCommand,
  trueArguments: Node[],
  message: Message,
) {
  const { client, author, channelId } = message;
  const parsedArguments = parseArgs(name, command, trueArguments, message);

  const result = await command.exec({
    message,
    args: parsedArguments as Record<string, ArgumentValue>,
    client,
  });
  await db
    .insert(commandExecutions)
    .values({
      name,
      type: "text",
      userId: author.id,
      messageId: message.id,
      channelId,
      guildId: message.guildId,
    })
    .catch(() => null);
  return result;
}

function parseArgs(
  commandName: string,
  command: TextCommand,
  trueArguments: Node[],
  message: Message,
) {
  const parsedArguments: Record<string, ArgumentValue | undefined> = {};
  for (const [name, argument] of Object.entries(command.args)) {
    let value: ArgumentValue | undefined;
    const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } =
      argument;
    switch (argument.type) {
      case "int": {
        const node = trueArguments.shift();
        if (!node) {
          break;
        }

        if (node?.type !== "int") {
          throw new CommandError(
            `Argument \`${name}\` must be an integer`,
            getNodeRange(node),
          );
        }

        const typedNode = node as Node<"int">;
        const n = typedNode.value.value;
        const small = n < min;
        const big = n > max;
        if (small || big) {
          throw new CommandError(
            `Argument \`${name}\` must be ${
              small && big ? `between ${min} and ${max}`
              : small ? `no less than ${min}`
              : `no more than ${max}`
            }`,
            getNodeRange(node),
          );
        }
        value = n;

        break;
      }

      case "float": {
        const node = trueArguments.shift();
        if (!node) {
          break;
        }

        if (node?.type !== "int" && node?.type !== "float") {
          throw new CommandError(
            `Argument \`${name}\` must be an number`,
            getNodeRange(node),
          );
        }

        const typedNode = node as Node<"int" | "float">;
        const n = typedNode.value.value;
        const small = n < min;
        const big = n > max;
        if (small || big) {
          throw new CommandError(
            `Argument \`${name}\` must be ${
              small && big ? `between ${min} and ${max}`
              : small ? `no less than ${min}`
              : `no more than ${max}`
            }`,
            getNodeRange(node),
          );
        }
        value = n;

        break;
      }

      case "word": {
        const node = trueArguments.shift();
        if (node) {
          value = stringifyNode(node);
          const small = value.length < min;
          const big = value.length > max;
          if (small || big) {
            throw new CommandError(
              `Argument \`${name}\` must be ${
                small && big ? `between ${min} and ${max}`
                : small ? `no less than ${min}`
                : `no more than ${max}`
              } characters long`,
              getNodeRange(node),
            );
          }
        }

        break;
      }

      case "words": {
        const argumentStrs = [...trueArguments];
        if (argumentStrs.length) {
          value = argumentStrs.map(stringifyNode).filter(Boolean);
        }
        break;
      }

      case "text": {
        const argumentStrs = [...trueArguments];
        if (argumentStrs.length) {
          value = argumentStrs.map(stringifyNode).join(" ");
          const small = value.length < min;
          const big = value.length > max;

          if (small || big) {
            const first = argumentStrs[0];
            throw new CommandError(
              `Argument \`${name}\` must be ${
                small && big ? `between ${min} and ${max}`
                : small ? `no less than ${min}`
                : `no more than ${max}`
              } characters long`,
              first ?
                [
                  getNodeRange(first)[0],
                  getNodeRange(argumentStrs.at(-1) || first)[1],
                ]
              : [0, 0],
            );
          }
        }

        break;
      }

      case "image": {
        const file = message.attachments.first();
        if (file) {
          if (
            typeof file.width === "number" &&
            typeof file.height === "number"
          ) {
            // @ts-expect-error should be fine, but TypeScript is being dumb
            value = file;
          } else {
            throw new TypeError(`Argument \`${name}\` must be an image file`);
          }
        } else if (argument.default === "user") {
          const size = 512;
          const url = message.author.displayAvatarURL({ size });
          value = {
            url,
            proxyURL: url,
            width: size,
            height: size,
          };
        }
        break;
      }

      case "video": {
        const file = message.attachments.first();
        if (file) {
          value = file.url;
        }
      }
    }

    if (value === undefined && argument.default !== undefined) {
      value = argument.default;
    }
    if (!argument.optional && value === undefined) {
      throw new Error(`Argument \`${name}\` is required

Usage: \`${getCommandUsage(commandName, command)}\`${
        command.examples ?
          `
Examples: \`\`\`${command.examples
            .map(args => `${env.PREFIX}${commandName} ${args}`)
            .join("\n")}\`\`\``
        : ""
      }`);
    }
    parsedArguments[name] = value;
  }

  return parsedArguments;
}

async function sendError(channel: TextBasedChannel, error: unknown) {
  try {
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setTitle("Error")
          .setDescription(error instanceof Error ? error.message : `${error}`)
          .setTimestamp(),
      ],
    });
  } catch (error) {
    logger.error("Failed to send error:", error);
  }
}

async function handleRandomResponse(message: Message) {
  const { cleanContent, author, channel, member } = message;
  const lowercase = cleanContent.toLowerCase();

  if (cleanContent.length === 5) {
    await handleWordleMessage(message);
  }
  await handleDiceMessage(message);

  if (lowercase.includes("ratio")) {
    await incCount(author.id, "ratio");
  }
  if (["noway", "norway"].includes(lowercase.replace(" ", ""))) {
    await channel.send(Math.random() < 0.1 ? "Norway" : "no way");
    await incCount(author.id, "no_way");
  } else {
    const msgs: string[] = [];
    for (const {
      id,
      words,
      responses,
      chance = 1,
      cooldown = 0,
      sentAt,
    } of await getRandomResponses()) {
      const includedWords = words.filter(word => !word.startsWith("-"));
      const excludedWords = words.filter(word => word.startsWith("-"));
      const included =
        includedWords.length ?
          includedWords.some(word => lowercase.includes(word))
        : true;
      const excluded =
        excludedWords.length ?
          excludedWords.some(word => lowercase.includes(word))
        : true;
      const now = Date.now();
      if (
        included &&
        excluded &&
        Math.random() < chance &&
        (!sentAt || now - sentAt.getTime() > cooldown)
      ) {
        msgs.push(choice(responses) || "");
        await db
          .update(randomResponses)
          .set({ sentAt: new Date() })
          .where(eq(randomResponses.id, id));
      }
    }

    if (msgs.length) {
      const msg = shuffle(msgs)
        .join(" ")
        .replaceAll(responseVariableRegex, match => {
          const variable = match.slice(1, -1);
          if (variable === "name") {
            return member?.displayName || author.username;
          }
          const props = variable.split(".");
          let value: any = getThemes();
          for (const prop of props) {
            // eslint-disable-next-line ts/no-unsafe-assignment
            value = value[prop];
          }

          return choice(value as string[]) || "";
        });
      await channel.send(msg);
    }
  }
}

const diceRegex = createRegExp(
  digit.times.between(1, 2).groupedAs("count").at.lineStart(),
  charIn("dD"),
  digit.times.between(1, 3).groupedAs("sides"),
  maybe(
    exactly(
      charIn("+-").as("operator"),
      digit.times.between(1, 2).groupedAs("modifier"),
    ).grouped(),
  ),
);

async function handleDiceMessage(message: Message) {
  const { content, channel } = message;
  const matchResult = content.match(diceRegex);
  if (matchResult) {
    const { groups } = matchResult;
    const count = Number.parseInt(groups.count || "1");
    const sides = Number.parseInt(groups.sides || "1");
    const operator = groups.operator || "+";
    const modifier = Number.parseInt(groups.modifier || "0");
    if (count > 0 && sides > 0) {
      const rolls = Array.from({ length: count }, () => {
        let n = randomInt(1, sides);
        if (operator === "+") {
          n += modifier;
        } else if (operator === "-") {
          n -= modifier;
        }
        return n;
      });
      let msg = rolls.join(", ");
      if (count > 1) {
        msg = `${sum(rolls)} = ${msg}`;
      }
      await channel.send(msg);
    }
  }
}

async function handleOneWordStory(message: Message) {
  const { content, guildId, author } = message;
  if (!guildId) {
    return;
  }

  const [word, word2] = content.trim().split(" ");
  if (!word || word2 || word.length > 32) {
    await message.delete();
    return;
  }

  const latestStory = await db.query.oneWordStory.findFirst({
    columns: {
      id: true,
    },
    where: and(eq(oneWordStory.guildId, guildId), oneWordStory.active),
    orderBy: desc(oneWordStory.createdAt),
  });
  if (!latestStory) {
    await message.delete();
    const reply = await message.channel.send(
      `No active story found. Please start a new story with \`/ows\``,
    );
    setTimeout(() => reply.delete(), 5000);
    return;
  }

  const latestEntry = await db.query.oneWordStoryEntry.findFirst({
    columns: {
      userId: true,
      word: true,
    },
    where: eq(oneWordStoryEntry.story, latestStory.id),
    orderBy: desc(oneWordStoryEntry.createdAt),
  });
  if (latestEntry?.userId.toString() === author.id) {
    await message.delete();
    return;
  }

  await db.insert(oneWordStoryEntry).values({
    userId: author.id,
    story: latestStory.id,
    word,
  });

  if (
    latestEntry?.word.toLowerCase() === "the" &&
    word.toLowerCase() === "end."
  ) {
    await db
      .update(oneWordStory)
      .set({
        active: false,
      })
      .where(eq(oneWordStory.id, latestStory.id));
    await message.reply(
      `The story has ended! ${userMention(env.OWNER_ID)} will post the whole story soon.`,
    );
  }
}

async function handleHaiku(message: Message) {
  const { content, channel } = message;

  const words = content.replaceAll("\n", " ").split(" ").filter(Boolean);
  const { syllable } = await import("syllable");
  const syllables = words.map(word => ({
    word,
    syllables: syllable(word),
  }));
  const totalSyllables = pipe(syllables, pick("syllables"), sum);
  if (totalSyllables !== 5 + 7 + 5) {
    return;
  }

  const line1: string[] = [];
  for (let i = 0; i < 5; ) {
    const word = syllables.shift();
    if (!word || i + word.syllables > 5) {
      return;
    }
    line1.push(word.word);
    i += word.syllables;
  }

  const line2: string[] = [];
  for (let i = 0; i < 7; ) {
    const word = syllables.shift();
    if (!word || i + word.syllables > 7) {
      return;
    }
    line2.push(word.word);
    i += word.syllables;
  }

  const line3: string[] = [];
  for (let i = 0; i < 5; ) {
    const word = syllables.shift();
    if (!word || i + word.syllables > 5) {
      return;
    }
    line3.push(word.word);
    i += word.syllables;
  }

  await channel.send(`Haiku detected:
\`\`\`
${line1.join(" ")}
${line2.join(" ")}
${line3.join(" ")}
\`\`\``);
}
