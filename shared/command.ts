import type { Client, Message } from 'discord.js';

interface ArgTypeMap {
  int: number;
  float: number;
  string: string;
  'string[]': string[];
}
type ArgType = keyof ArgTypeMap;

interface Arg<T extends ArgType = ArgType> {
  name: string;
  type: T;
  desc: string;
  optional?: boolean;
  default?: ArgTypeMap[T];
}

type Args = readonly Arg[];

type ArgValue<T extends Arg> = T['default'] extends ArgTypeMap[ArgType]
  ? ArgTypeMap[T['type']]
  : T['optional'] extends true
  ? ArgTypeMap[T['type']] | undefined
  : ArgTypeMap[T['type']];

type Exec<T extends Args> = (
  message: Message,
  args: {
    [I in keyof T]: ArgValue<T[I]>;
  },
  client: Client
) => Promise<any>;

interface CommandParams<T extends Args> {
  name: string;
  aliases?: string[];
  desc: string;
  args: T;
}

type Command<
  T extends Args = Args,
  S extends Args[] = Args[]
> = CommandParams<T> & {
  exec: Exec<T>;
  subcommands?: { [I in keyof S]: Command<S[I]> };
};

export const createCommand = <T extends Args, S extends Args[]>(
  cmd: CommandParams<T>,
  exec: Exec<T>,
  subcommands?: { [I in keyof S]: Command<S[I]> }
): Command<T> => ({ ...cmd, exec, subcommands });
