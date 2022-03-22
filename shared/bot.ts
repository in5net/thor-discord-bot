import { Client, MessageEmbed } from 'discord.js';
import type { IntentsString, Message } from 'discord.js';

import type Command from './command';

export default class DiscordBot {
  client: Client;
  commands: Command[] = [];
  onMessageFn?: (message: Message) => any;

  constructor(
    readonly name: string,
    readonly prefix: string,
    intents: IntentsString[],
    private token?: string
  ) {
    this.client = new Client({
      intents,
      partials: ['CHANNEL']
    }).once('ready', () => console.log(`✅ ${name} is ready!`));
  }

  addCommands(commands: Command[]) {
    this.commands.push(...commands);
    return this;
  }

  onMessage(onMessageFn: (message: Message) => any) {
    this.onMessageFn = onMessageFn;
    return this;
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
      let { commands } = this;
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
        else await command.exec(message, trueArgs, client);
      } catch (err) {
        try {
          await channel.send({
            embeds: [
              new MessageEmbed()
                .setTitle('Error')
                .setDescription(`${err}`)
                .setColor('RED')
            ]
          });
        } catch {
          console.error('Failed to send error:', err);
        }
      }
      client.user?.setActivity();
    });
    await client.login(token);
    client.user?.setActivity();
  }
}
