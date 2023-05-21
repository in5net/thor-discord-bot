import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder
} from 'discord.js';
import { closest } from 'fastest-levenshtein';
import { caseInsensitive, createRegExp, exactly } from 'magic-regexp';

import {
  Command,
  CommandGroups,
  Commands,
  OptionValue
} from '$services/commands/slash';
import { ArgValue, TextCommand } from '$services/commands/text';
import prisma from '$services/prisma';
import client from './client';
import * as rawCommands from './commands';
import textCommands from './text-commands';
import help from './text-commands/help';

const commands = Object.fromEntries(
  Object.entries(rawCommands as unknown as Commands | CommandGroups).map(
    ([name, command]) => [name, normalize(command)]
  )
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

client
  .on('messageCreate', async message => {
    const { content, channel, channelId, author } = message;
    if (author.bot) return;
    if (!('send' in channel)) return;
    let lowercase = content.toLowerCase();
    if (
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
            const suggestion = closest(commandName, Object.keys(commands));
            await channel.send(
              `${
                Math.random() < 0.1 ? 'No' : `IDK what \`${commandName}\` is`
              }. Did you mean ${suggestion}?`
            );
          } else {
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
    }
  })
  .on('messageReactionAdd', async (reaction, user) => {
    if (user.id === process.env.OWNER_ID)
      await reaction.message.react(reaction.emoji).catch(() => {});
  })
  .on('interactionCreate', async i => {
    if (i.isChatInputCommand()) {
      const command = getCommand(i);
      if (!command) return;

      const { options, handler } = command;
      const name = [
        i.commandName,
        i.options.getSubcommandGroup(false),
        i.options.getSubcommand(false)
      ]
        .filter(Boolean)
        .join(' ');
      try {
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
    }
  })
  .on('interactionError', console.error);
