import { Client, MessageEmbed } from 'discord.js';
import type { IntentsString, Message } from 'discord.js';

import type Command from './command';

export default class DiscordBot {
  client: Client;
  commands: Command[] = [];

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

  onMessage(onMessage: (message: Message) => any) {
    const { client, prefix } = this;
    client.on('message', async message => {
      if (message.author.bot) return;

      let value = onMessage(message);
      if (value instanceof Promise) value = await value;
      if (value) return;

      const { content, channel } = message;
      if (!content.startsWith(prefix)) return;

      const args = content.slice(prefix.length).split(' ');
      if (!args.length) return;

      const trueArgs = [...args];
      let command: Command | undefined;
      let { commands } = this;
      const commandNames: string[] = [];
      for (const arg of args) {
        commandNames.push(arg);
        const subcommand = commands.find(
          ({ name, aliases }) =>
            name === arg.toLowerCase() || aliases?.includes(arg.toLowerCase())
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
    return this;
  }

  async run() {
    const { client, token } = this;
    await client.login(token);
    client.user?.setActivity();
  }
}
