import {
  type ApplicationCommandOptionChoiceData,
  type APIInteractionDataResolvedChannel,
  type Attachment,
  type AutocompleteInteraction,
  type Awaitable,
  type ChatInputCommandInteraction,
  type GuildBasedChannel,
  type User,
} from "discord.js";

type Choice = string | ApplicationCommandOptionChoiceData;

export interface CommandOptionType {
  string: string;
  int: number;
  float: number;
  bool: boolean;
  choice: Choice;
  user: User;
  channel: APIInteractionDataResolvedChannel | GuildBasedChannel;
  attachment: Attachment;
}
type Type = keyof CommandOptionType;

type Choices = readonly Choice[] | Record<string, string>;
type ValueFromChoices<T extends Choices> =
  T extends readonly Choice[] ?
    T[number] extends { value: infer V } ?
      V
    : T[number]
  : keyof T;

export type AutocompleteHandler = (
  option: string,
  i: AutocompleteInteraction,
) => Promise<Choices>;
interface Option<T extends Type = Type, C extends Choices = Choices> {
  type: T;
  desc: string;
  min?: number;
  max?: number;
  choices?: C;
  optional?: boolean;
  default?: CommandOptionType[T];
  autocomplete?: AutocompleteHandler;
}
type Options = Record<string, Option>;

type ValueFromOption<T extends Option> =
  T["choices"] extends Choices ? ValueFromChoices<T["choices"]>
  : CommandOptionType[T["type"]];
export type OptionValue<T extends Option = Option> =
  T["default"] extends CommandOptionType[Type] ? ValueFromOption<T>
  : T["optional"] extends true ? ValueFromOption<T> | undefined
  : ValueFromOption<T>;

type Handler<T extends Options = Options> = (
  i: ChatInputCommandInteraction,
  options: {
    [K in keyof T]: OptionValue<T[K]>;
  },
) => Awaitable<any>;

type Permission = "vc";
interface CommandOptions<T extends Options> {
  desc: string;
  options: T;
  permissions?: Permission[];
}
export interface SlashCommand<T extends Options = Options>
  extends CommandOptions<T> {
  handler: Handler<T>;
  symbol: symbol;
}

export const slashCommandSymbol = Symbol("slash command");

const command = <const T extends Options>(
  options: CommandOptions<T>,
  handler: Handler<T>,
): SlashCommand<T> => ({ ...options, handler, symbol: slashCommandSymbol });
export default command;

export const isSlashCommand = (x: unknown): x is SlashCommand =>
  typeof x === "object" &&
  !!x &&
  "symbol" in x &&
  x.symbol === slashCommandSymbol;
