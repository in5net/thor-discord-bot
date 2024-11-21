import { type ButtonInteraction, type Awaitable } from "discord.js";

type Handler = (i: ButtonInteraction) => Awaitable<any>;

export interface ButtonHandler {
  handler: Handler;
  symbol: symbol;
}

export const buttonSymbol = Symbol("button");

const handleButton = (handler: Handler): ButtonHandler => ({
  handler,
  symbol: buttonSymbol,
});
export default handleButton;

export const isButtonHandler = (x: unknown): x is ButtonHandler =>
  typeof x === "object" && !!x && "symbol" in x && x.symbol === buttonSymbol;
