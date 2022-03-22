import type { Client, Message } from 'discord.js';

interface Command {
  name: string;
  desc: string;
  usage?: string;
  aliases?: string[];
  exec(message: Message, args: string[], client: Client): Promise<any>;
  subcommands?: Command[];
}
export default Command;
