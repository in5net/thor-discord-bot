import { Client, MessageEmbed } from 'discord.js';
import type { IntentsString, Message } from 'discord.js';

import type Command from './command';
import type { ArgV } from './command';

export default class DiscordBot {
  client: Client;
  commands: Command[] = [];
  onReadyFn?: () => any;
  onMessageFn?: (message: Message) => any;

  constructor(
    readonly name: string,
    readonly prefix: string,
    intents: IntentsString[],
    private token?: string
  ) {
    console.log(`⏳ ${name} is starting...`);
    console.time(name);
    this.client = new Client({
      intents,
      partials: ['CHANNEL']
    }).once('ready', () => {
      console.timeEnd(name);
      console.log(`✅ ${name} is ready!`);
      this.onReadyFn?.();
    });
  }

  addCommands(commands: Command[]) {
    this.commands.push(...commands);
    return this;
  }

  onReady(onReadyFn: () => any) {
    this.onReadyFn = onReadyFn;
    return this;
  }

  onMessage(onMessageFn: (message: Message) => any) {
    this.onMessageFn = onMessageFn;
    return this;
  }

  errorEmbed(error: unknown) {
    return new MessageEmbed()
      .setTitle('Error')
      .setDescription(`${error}`)
      .setColor('RED');
  }

  async run() {
    const { client, prefix, token, onMessageFn } = this;
    client.on('messageCreate', async message => {
      if (message.author.bot) return;

      if (onMessageFn) {
        let value = onMessageFn(message);
        if (value instanceof Promise) value = await value;
        if (value) return;
      }

      const { content, channel } = message;
      if (!content.toLowerCase().startsWith(prefix.toLowerCase())) return;

      const args = content.slice(prefix.length).split(' ');
      if (!args.length) return;

      const trueArgs = [...args];
      let command: Command | undefined;
      let commands = this.commands as readonly Command[];
      const commandNames: string[] = [];
      for (const arg of args) {
        commandNames.push(arg);
        const lowerArg = arg.toLowerCase();
        const subcommand = commands.find(
          ({ name, aliases }) =>
            name === lowerArg || aliases?.includes(lowerArg)
        );
        if (!subcommand) break;
        trueArgs.shift();
        command = subcommand;
        commands = subcommand.subcommands || [];
      }

      try {
        if (!command)
          await channel.send(
            Math.random() < 0.1
              ? 'No.'
              : `IDK what \`${commandNames.join(' ')}\` is`
          );
        else {
          const mentions = [...message.mentions.users.values()];

          const parsedArgs: (ArgV | undefined)[] = [];
          for (let i = 0; i < command.args.length; i++) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const arg = command.args[i]!;

            let value: ArgV | undefined;
            switch (arg.type) {
              case 'int':
                {
                  const argStr = trueArgs.shift();
                  if (argStr) {
                    const num = parseInt(argStr);
                    if (isNaN(num))
                      throw new Error(
                        `Argument \`${arg.name}\` must be an integer`
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
                        `Argument \`${arg.name}\` must be an float`
                      );
                    value = num;
                  }
                }
                break;
              case 'bool':
                {
                  const argStr = trueArgs.shift();
                  value = argStr === arg.name;
                }
                break;
              case 'string':
                {
                  const argStr = trueArgs.shift();
                  if (argStr) value = argStr;
                }
                break;
              case 'string[]':
                {
                  const argStrs = [...trueArgs];
                  if (argStrs.length) value = argStrs;
                }
                break;
              case 'mention':
                {
                  trueArgs.shift();
                  const mention = mentions.shift();
                  if (mention) value = mention;
                }
                break;
            }

            if (value === undefined && arg.default !== undefined)
              value = arg.default;
            if (!arg.optional && value === undefined)
              throw new Error(`Argument \`${arg.name}\` is required`);
            parsedArgs.push(value);
          }
          await command.exec(message, parsedArgs, client);
        }
      } catch (error) {
        try {
          await channel.send({
            embeds: [
              this.errorEmbed(error instanceof Error ? error.message : error)
            ]
          });
        } catch {
          console.error('Failed to send error:', error);
        }
      }
      client.user?.setActivity();
    });
    await client.login(token);
    client.user?.setActivity();
  }
}
