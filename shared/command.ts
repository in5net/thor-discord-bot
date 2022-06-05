import type { Client, Message, User } from 'discord.js';

interface ArgTypeMap {
  int: number;
  float: number;
  bool: boolean;
  string: string;
  'string[]': string[];
  mention: User;
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
type SubArgs = readonly Args[];

export type ArgValue<T extends Arg = Arg> =
  T['default'] extends ArgTypeMap[ArgType]
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
  S extends SubArgs = SubArgs
> = CommandParams<T> & {
  exec: Exec<T>;
  subcommands?: { [I in keyof S]: Command<S[I]> };
};
export default Command;

export const command = <T extends Args, S extends SubArgs>(
  cmd: CommandParams<T>,
  exec: Exec<T>,
  subcommands?: { [I in keyof S]: Command<S[I]> }
): Command<T, S> => ({ ...cmd, exec, subcommands });
