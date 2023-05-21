import type { Awaitable, Client, Message } from 'discord.js';

interface ArgTypeMap {
  int: number;
  float: number;
  word: string;
  words: string[];
  text: string;
}
type ArgType = keyof ArgTypeMap;

export const argType2Name: Record<ArgType, string> = {
  int: 'integer',
  float: 'number',
  word: 'word',
  words: 'words',
  text: 'text'
};

interface Arg<T extends ArgType = ArgType> {
  type: T;
  desc: string;
  optional?: boolean;
  default?: ArgTypeMap[T];
}

export type Args = Record<string, Arg>;
type SubArgs = Record<string, Args>;

export type ArgValue<T extends Arg = Arg> =
  T['default'] extends ArgTypeMap[ArgType]
    ? ArgTypeMap[T['type']]
    : T['optional'] extends true
    ? ArgTypeMap[T['type']] | undefined
    : ArgTypeMap[T['type']];

export type Exec<T extends Args> = (params: {
  message: Message;
  args: {
    [I in keyof T]: ArgValue<T[I]>;
  };
  client: Client;
}) => Awaitable<any>;

type Permission = 'vc';
export interface TextCommandParams<T extends Args> {
  aliases?: string[];
  desc: string;
  optionalPrefix?: boolean;
  args: T;
  permissions?: Permission[];
}

export interface TextCommand<T extends Args = Args, S extends SubArgs = SubArgs>
  extends TextCommandParams<T> {
  exec: Exec<T>;
  subcommands?: { [I in keyof S]: TextCommand<S[I]> };
}

const command = <T extends Args, S extends SubArgs>(
  cmd: TextCommandParams<T>,
  exec: Exec<T>,
  subcommands?: { [I in keyof S]: TextCommand<S[I]> }
): TextCommand<T, S> => ({ ...cmd, exec, subcommands });
export default command;
