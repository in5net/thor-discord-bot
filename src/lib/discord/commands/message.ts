import {
  type Awaitable,
  type MessageContextMenuCommandInteraction,
} from "discord.js";

type Handler = (i: MessageContextMenuCommandInteraction) => Awaitable<any>;

export interface MessageCommand {
  name: string;
  handler: Handler;
  symbol: symbol;
}

const messageCommandSymbol = Symbol("message command");

const command = (name: string, handler: Handler): MessageCommand => ({
  name,
  handler,
  symbol: messageCommandSymbol,
});
export default command;

export const isMessageCommand = (x: unknown): x is MessageCommand =>
  typeof x === "object" &&
  !!x &&
  "symbol" in x &&
  x.symbol === messageCommandSymbol;
