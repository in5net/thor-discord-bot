import { random, shuffle } from '@in5net/limitless';
import {
  AutocompleteInteraction,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  userMention
} from 'discord.js';
import { closest } from 'fastest-levenshtein';
import { Timestamp } from 'firebase-admin/firestore';
import {
  caseInsensitive,
  createRegExp,
  exactly,
  global,
  whitespace
} from 'magic-regexp';
import { parse } from 'node:path';

import {
  Command,
  CommandGroups,
  Commands,
  OptionValue
} from '$services/commands/slash';
import { ArgValue, TextCommand } from '$services/commands/text';
import prisma from '$services/prisma';
import { incCount } from '$services/users';
import woof from '$services/woof';
import client from './client';
import * as messageCommands from './commands/messages';
import * as rawCommands from './commands/mod';
import voices from './music/voice-manager';
import randomResponses, { randomResponsesRef } from './responses';
import help from './text-commands/help';
import textCommands from './text-commands/mod';
import { handleWordleMessage } from './text-commands/wordle';

const { default: oddNameCommands = {}, ...normalCommands } = rawCommands;
const commands = Object.fromEntries(
  Object.entries({
    ...normalCommands,
    ...oddNameCommands
  } as unknown as Commands | CommandGroups).map(([name, command]) => [
    name,
    normalize(command)
  ])
);
function normalize(
  command: Command | Commands | CommandGroups
): Command | Commands | CommandGroups {
  if (typeof command.desc === 'string') return command as Command;

  const { default: oddNameCommands = {}, ...normalCommands } =
    command as unknown as Commands | CommandGroups;
  return Object.fromEntries(
    Object.entries({ ...oddNameCommands, ...normalCommands }).map(
      ([subName, subCommand]) => [
        subName,
        normalize(subCommand as Command | Commands) as Command
      ]
    )
  );
}

function getCommand(
  i: ChatInputCommandInteraction | AutocompleteInteraction
): Command | void {
  const command = commands[i.commandName];
  if (!command) return;

  const subGroupName = i.options.getSubcommandGroup(false);
  if (subGroupName) {
    const subGroup = (command as CommandGroups)[subGroupName];
    if (!subGroup) return;

    const subName = i.options.getSubcommand();
    const subCommand = subGroup[subName];
    return subCommand;
  }

  const subName = i.options.getSubcommand(false);
  if (subName) {
    const subCommand = (command as Commands)[subName];
    return subCommand;
  }

  return command as Command;
}

const optionalPrefixCommands = Object.entries(textCommands)
  .filter(([, command]) => command.optionalPrefix)
  .map(([name]) => name);
console.log('Optional prefix commands:', optionalPrefixCommands);

const prefix = process.env.PREFIX || '';
const prefixRegex = createRegExp(exactly(prefix).at.lineStart(), [
  caseInsensitive
]);
const whitespaceRegex = createRegExp(whitespace, [global]);

client
  .on('messageCreate', async message => {
    const { content, channel, channelId, author, member, attachments } =
      message;
    if (author.bot) return;
    if (!('send' in channel)) return;
    let lowercase = content.toLowerCase();
    const noWhitespace = lowercase.replaceAll(whitespaceRegex, '');
    if (
      ['among', 'imposter', 'imposta', 'amogus', 'mongus'].some(str =>
        noWhitespace.includes(str)
      ) &&
      author.id !== client.user?.id
    ) {
      await message.delete().catch();
      let msg = 'salad mundus detected';
      if (Math.random() < 0.3)
        msg += ` gave 1 strike to ${userMention(message.author.id)}`;
      await channel.send(msg).catch();
      await incCount(author.id, 'salad_mundus');
    } else if (
      prefixRegex.test(content) ||
      optionalPrefixCommands.some(name => lowercase.startsWith(name))
    ) {
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
      for (const line of lines) {
        const args = line.replace(prefixRegex, '').split(' ');
        if (!args.length) continue;

        const trueArgs = [...args];
        let command: TextCommand | undefined;
        let commands = { ...textCommands, help } as unknown as Record<
          string,
          TextCommand
        >;
        const commandNames: string[] = [];
        for (const arg of args) {
          commandNames.push(arg);
          const lowerArg = arg.toLowerCase();
          const subcommand = Object.entries(commands).find(
            ([name, { aliases }]) =>
              name === lowerArg || aliases?.includes(lowerArg)
          )?.[1];
          if (!subcommand) break;
          trueArgs.shift();
          command = subcommand;
          commands = subcommand.subcommands || {};
        }

        const commandName = commandNames.join(' ');
        try {
          if (!command) {
            const suggestion = closest(
              commandName,
              Object.entries(commands)
                .filter(([, command]) => !command.optionalPrefix)
                .map(([name]) => name)
            );
            await channel.send(
              `${
                Math.random() < 0.1 ? 'No' : `IDK what \`${commandName}\` is`
              }. Did you mean ${suggestion}?`
            );
          } else if (
            command.permissions?.includes('vc') &&
            !message.member?.voice.channel
          )
            await message.reply(`${woof()}, you are not in a voice channel`);
          else {
            const parsedArgs: Record<string, ArgValue | undefined> = {};
            for (const [name, arg] of Object.entries(command.args)) {
              let value: ArgValue | undefined;
              switch (arg.type) {
                case 'int':
                  {
                    const argStr = trueArgs.shift();
                    if (argStr) {
                      const num = parseInt(argStr);
                      if (isNaN(num))
                        throw new Error(
                          `Argument \`${name}\` must be an integer, got \`${argStr}\``
                        );
                      value = num;
                    }
                  }
                  break;
                case 'float':
                  {
                    const argStr = trueArgs.shift();
                    if (argStr) {
                      const num = parseFloat(argStr);
                      if (isNaN(num))
                        throw new Error(
                          `Argument \`${name}\` must be an float, got \`${argStr}\``
                        );
                      value = num;
                    }
                  }
                  break;
                case 'word':
                  {
                    const argStr = trueArgs.shift();
                    if (argStr) value = argStr;
                  }
                  break;
                case 'words':
                  {
                    const argStrs = [...trueArgs];
                    if (argStrs.length) value = argStrs.filter(Boolean);
                  }
                  break;
                case 'text': {
                  const argStrs = [...trueArgs];
                  if (argStrs.length) value = argStrs.join(' ');
                }
              }

              if (value === undefined && arg.default !== undefined)
                value = arg.default;
              if (!arg.optional && value === undefined)
                throw new Error(`Argument \`${name}\` is required`);
              parsedArgs[name] = value;
            }
            await command.exec({
              message,
              args: parsedArgs as Record<string, ArgValue>,
              client
            });
            await prisma.commandExecution.create({
              data: {
                name: commandName,
                type: 'Text',
                userId: BigInt(author.id),
                messageId: BigInt(message.id),
                channelId: BigInt(channelId),
                guildId: message.guildId ? BigInt(message.guildId) : undefined
              }
            });
          }
        } catch (error) {
          console.error(error);
          try {
            await channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor('Red')
                  .setTitle('Error')
                  .setDescription(
                    error instanceof Error ? error.message : `${error}`
                  )
                  .setTimestamp()
              ]
            });
          } catch (error) {
            console.error('Failed to send error:', error);
          }
        }
      }
    } else {
      if (content.length === 5) await handleWordleMessage(message);

      // Remove @mentions
      lowercase = lowercase.replace(/<@!?\d+>/g, '');
      if (lowercase.includes('ratio')) await incCount(author.id, 'ratio');
      if (['noway', 'norway'].includes(lowercase.replace(' ', ''))) {
        await channel.send(Math.random() < 0.1 ? 'Norway' : 'no way');
        await incCount(author.id, 'no_way');
      } else {
        const msgs: string[] = [];
        for (const {
          id,
          words,
          responses,
          chance = 1,
          cooldown = 0,
          sentAt
        } of randomResponses()) {
          const includedWords = words.filter(word => !word.startsWith('-'));
          const excludedWords = words.filter(word => word.startsWith('-'));
          const included = includedWords.length
            ? includedWords.some(word => lowercase.includes(word))
            : true;
          const excluded = excludedWords.length
            ? excludedWords.some(word => lowercase.includes(word))
            : true;
          const now = Date.now();
          if (
            included &&
            excluded &&
            Math.random() < chance &&
            (!sentAt || now - sentAt.toMillis() > cooldown)
          ) {
            msgs.push(random(responses));
            randomResponsesRef.doc(id).update({
              sentAt: Timestamp.now()
            });
          }
        }

        if (msgs.length) {
          const msg = shuffle(msgs)
            .join(' ')
            .replaceAll('{name}', member?.displayName || author.username);
          await channel.send(msg);
        }
      }
    }

    if (
      channel.isTextBased() &&
      channel.type !== ChannelType.DM &&
      !channel.isThread() &&
      !channel.nsfw
    )
      await prisma.file.createMany({
        data: attachments.map(({ id, name: fileName, proxyURL }) => {
          const { base, name, ext } = parse(fileName);
          return {
            id: BigInt(id),
            base,
            name,
            ext,
            authorId: BigInt(author.id),
            messageId: BigInt(message.id),
            channelId: BigInt(channelId),
            guildId: BigInt(channel.guildId),
            proxyURL
          };
        })
      });
  })
  .on('messageReactionAdd', async (reaction, user) => {
    if (user.id === process.env.OWNER_ID)
      await reaction.message.react(reaction.emoji).catch(() => {});
  })
  .on('interactionCreate', async i => {
    if (i.isChatInputCommand()) {
      const command = getCommand(i);
      if (!command) return;

      const { options, permissions, handler } = command;
      const name = [
        i.commandName,
        i.options.getSubcommandGroup(false),
        i.options.getSubcommand(false)
      ]
        .filter(Boolean)
        .join(' ');
      try {
        const { member } = i;
        if (
          permissions?.includes('vc') &&
          (!(member instanceof GuildMember) || !member?.voice.channel)
        )
          await i.reply(`${woof()}, you are not in a voice channel`);
        else
          await handler(
            i,
            Object.fromEntries(
              Object.entries(options).map(([name, { type, default: d }]) => {
                let value: OptionValue | null;
                switch (type) {
                  case 'string':
                    value = i.options.getString(name);
                    break;
                  case 'int':
                    value = i.options.getInteger(name);
                    break;
                  case 'float':
                    value = i.options.getNumber(name);
                    break;
                  case 'bool':
                    value = i.options.getBoolean(name);
                    break;
                  case 'choice':
                    value = i.options.getString(name);
                    break;
                  case 'user':
                    value = i.options.getUser(name);
                    break;
                  case 'channel':
                    value = i.options.getChannel(name);
                    break;
                  case 'attachment':
                    value = i.options.getAttachment(name);
                }
                return [
                  name,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  (value ?? d)!
                ];
              })
            )
          );
        await prisma.commandExecution.create({
          data: {
            name,
            type: 'Slash',
            userId: BigInt(i.user.id),
            channelId: BigInt(i.channelId),
            guildId: i.guildId ? BigInt(i.guildId) : undefined
          }
        });
      } catch (error) {
        console.error(`Error while running command '${name}':`, error);
        if (error instanceof Error) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Error')
            .setDescription(error.message)
            .setTimestamp();
          if (i.replied)
            await i
              .followUp({ embeds: [embed], ephemeral: true })
              .catch(console.error);
          else if (i.deferred)
            await i.editReply({ embeds: [embed] }).catch(console.error);
          else
            await i
              .reply({ embeds: [embed], ephemeral: true })
              .catch(console.error);
        }
      }
    } else if (i.isAutocomplete()) {
      const command = getCommand(i);
      if (!command) return;

      const option = i.options.getFocused(true);
      const handleAutocomplete = command.options[option.name]?.autocomplete;
      if (!handleAutocomplete) return;

      const options = await handleAutocomplete(option.value, i);
      return i
        .respond(
          options instanceof Array
            ? options.map(o => ({
                name: o.toString(),
                value: o
              }))
            : Object.entries(options).map(([name, value]) => ({
                name,
                value
              }))
        )
        .catch(console.error);
    } else if (i.isMessageContextMenuCommand()) {
      const command = Object.values(messageCommands).find(
        ({ name }) => name === i.commandName
      );
      if (!command) return;

      const { handler } = command;
      const name = i.commandName;
      try {
        await handler(i);
        await prisma.commandExecution.create({
          data: {
            name,
            type: 'Message',
            userId: BigInt(i.user.id),
            messageId: BigInt(i.targetId),
            channelId: BigInt(i.channelId),
            guildId: i.guildId ? BigInt(i.guildId) : undefined
          }
        });
      } catch (error) {
        console.error(`Error while running command '${name}':`, error);
        if (error instanceof Error) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Error')
            .setDescription(error.message)
            .setTimestamp();
          if (i.replied)
            await i
              .followUp({ embeds: [embed], ephemeral: true })
              .catch(console.error);
          else if (i.deferred)
            await i.editReply({ embeds: [embed] }).catch(console.error);
          else
            await i
              .reply({ embeds: [embed], ephemeral: true })
              .catch(console.error);
        }
      }
    }
  })
  .on('interactionError', console.error);

const timeouts: Map<string, NodeJS.Timeout> = new Map();
const FIVE_MINUTES = 1000 * 60 * 5;
client.on('voiceStateUpdate', oldState => {
  const members = oldState.channel?.members;
  if (!members || !members.has(process.env.DISCORD_ID || '')) return;

  const guildId = oldState.guild.id;
  if (members.size === 1) {
    const timeout = timeouts.get(guildId);
    if (timeout) timeout.refresh();
    else {
      timeouts.set(
        guildId,
        setTimeout(() => {
          const voice = voices.get(guildId);
          voice?.stop();
          timeouts.delete(guildId);
        }, FIVE_MINUTES)
      );
    }
  } else {
    const timeout = timeouts.get(guildId);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.delete(guildId);
    }
  }
});
