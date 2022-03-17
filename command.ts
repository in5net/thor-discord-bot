import type { Message } from 'discord.js';

interface Command {
  name: string;
  desc: string;
  usage?: string;
  aliases?: string[];
  exec(message: Message, args: string[]): Promise<any>;
  subcommands?: Command[];
}
export default Command;
