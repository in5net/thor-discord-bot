import { Collection, EmbedBuilder } from 'discord.js';
import { closest } from 'fastest-levenshtein';
import { caseInsensitive, createRegExp, exactly } from 'magic-regexp';

import { ArgValue, TextCommand } from '$services/commands/text';
import event from '$services/event';
import prisma from '$services/prisma';

const prefix = process.env.PREFIX;
const prefixRegex = createRegExp(exactly(prefix).at.lineStart(), [
  caseInsensitive,
]);

export default event(
  { name: 'messageCreate' },
  async ({ client, args: [message] }) => {
    const { content, channel, channelId, author } = message;
    if (author.bot) return;
    if (!('send' in channel)) return;
    let lowercase = content.toLowerCase();

    const optionalPrefixCommands = [
      ...client.textCommands.filter(command => command.optionalPrefix).keys(),
    ];
    if (
      prefixRegex.test(content) ||
      optionalPrefixCommands.some(name => lowercase.startsWith(name))
    ) {
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
      for (const line of lines) {
        const suggest = line.startsWith(prefix);
        const args = line.replace(prefixRegex, '').split(' ');
        if (!args.length) continue;

        const trueArgs = [...args];
        let commands = client.textCommands;
        let command: TextCommand | undefined;
        const commandNames: string[] = [];
        for (const arg of args) {
          commandNames.push(arg);
          const lowerArg = arg.toLowerCase();
          const subcommand = client.textCommands.find(
            ({ aliases }, name) =>
              name === lowerArg || aliases?.includes(lowerArg)
          );
          if (!subcommand) break;
          trueArgs.shift();
          command = subcommand;
          commands = new Collection(
            Object.entries(subcommand.subcommands || {})
          );
        }

        const commandName = commandNames.join(' ');
        try {
          if (!command) {
            if (suggest) {
              const suggestion = closest(commandName, Object.keys(commands));
              await channel.send(
                `${
                  Math.random() < 0.1 ? 'No' : `IDK what \`${commandName}\` is`
                }. Did you mean ${suggestion}?`
              );
            }
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
              client,
            });
            await prisma.commandExecution.create({
              data: {
                name: commandName,
                type: 'Text',
                userId: BigInt(author.id),
                messageId: BigInt(message.id),
                channelId: BigInt(channelId),
                guildId: message.guildId ? BigInt(message.guildId) : undefined,
              },
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
                  .setTimestamp(),
              ],
            });
          } catch (error) {
            console.error('Failed to send error:', error);
          }
        }
      }
    }
  }
);
