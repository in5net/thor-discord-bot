import { Client } from 'discord.js';
import type { IntentsString, Message } from 'discord.js';

import type Command from './command';

export default class DiscordBot {
  client: Client;
  commands: Command[] = [];

  constructor(
    readonly name: string,
    readonly prefix: string,
    intents: IntentsString[],
    private token: string
  ) {
    this.client = new Client({
      intents,
      partials: ['CHANNEL']
    }).once('ready', () => console.log(`✅ ${name} is ready!`));
  }

  addCommands(commands: Command[]) {
    this.commands.push(...commands);
  }

  onMessage(onMessage: (message: Message) => any) {
    const { client, prefix } = this;
    client.on('message', async message => {
      if (message.author.bot) return;

      let value = onMessage(message);
      if (value instanceof Promise) value = await value;
      if (value) return;

      const { content } = message;
      if (!content.startsWith(prefix)) return;

      const args = content.slice(prefix.length).split(' ');
      if (!args.length) return;

      const trueArgs = [...args];
      let command: Command | undefined;
      let { commands } = this;
      for (const arg of args) {
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
          await message.channel.send(
            Math.random() < 0.1 ? 'No.' : `IDK what ${command} is`
          );
        else await command.exec(message, trueArgs);
      } catch (err) {
        await message.channel.send(`Error ): ${err}`);
      }
      client.user?.setActivity();
    });
  }

  async run() {
    const { client, token } = this;
    await client.login(token);
    client.user?.setActivity();
  }
}
