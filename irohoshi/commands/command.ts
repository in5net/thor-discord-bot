import { ApplicationCommandInteraction, InteractionUser } from '../deps.ts';

export interface CommandOptionType {
  int: number;
  float: number;
  string: string;
  user: InteractionUser;
  choice: string;
}
type Type = keyof CommandOptionType;

type Choices = readonly string[] | Record<string, string>;
type ValueFromChoices<T extends Choices> = T extends readonly string[]
  ? T[number]
  : keyof T;

interface Option<T extends Type = Type, C extends Choices = Choices> {
  type: T;
  desc: string;
  min?: number;
  max?: number;
  choices?: C;
  optional?: boolean;
  default?: CommandOptionType[T];
}
type Options = Record<string, Option>;
type SubOptions = Record<string, Options>;

type ValueFromOption<T extends Option> = T['choices'] extends Choices
  ? ValueFromChoices<T['choices']>
  : CommandOptionType[T['type']];
type OptionValue<T extends Option> =
  T['default'] extends CommandOptionType[Type]
    ? ValueFromOption<T>
    : T['optional'] extends true
    ? ValueFromOption<T> | undefined
    : ValueFromOption<T>;

type Handler<T extends Options = Options> = (
  i: ApplicationCommandInteraction,
  options: {
    [K in keyof T]: OptionValue<T[K]>;
  }
) => void;

interface CommandOptions<T extends Options> {
  desc: string;
  options: T;
}
export interface Command<
  T extends Options = Options,
  S extends SubOptions = SubOptions
> extends CommandOptions<T> {
  handler: Handler<T>;
  subcommands?: {
    [K in keyof S]: Command<S[K]>;
  };
}
export type Commands = Record<string, Command>;

const command = <T extends Options, S extends SubOptions>(
  options: CommandOptions<T>,
  handler: Handler<T>,
  subcommands?: {
    [K in keyof S]: Command<S[K]>;
  }
): Command<T, S> => ({ ...options, handler, subcommands });
export default command;
