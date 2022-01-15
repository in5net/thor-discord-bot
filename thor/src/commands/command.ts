import type { Message } from 'discord.js';

type Command = (message: Message, args: string[]) => void;

export default Command;
