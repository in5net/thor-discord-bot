import {
	type Attachment,
	type Awaitable,
	type Client,
	type Message,
} from "discord.js";

interface ArgumentTypeMap {
	int: number;
	float: number;
	word: string;
	words: string[];
	text: string;
	image: Attachment;
}
type ArgumentType = keyof ArgumentTypeMap;

interface DefaultTypeMap {
	int: number;
	float: number;
	word: string;
	words: string[];
	text: string;
	image: "user";
}

export const argumentType2Name: Record<ArgumentType, string> = {
	int: "integer",
	float: "number",
	word: "word",
	words: "words",
	text: "text",
	image: "image",
};

interface Argument<T extends ArgumentType = ArgumentType> {
	type: T;
	desc: string;
	optional?: boolean;
	default?: DefaultTypeMap[T];
}

export type Arguments = Record<string, Argument>;

export type ArgumentValue<T extends Argument = Argument> =
	T["default"] extends DefaultTypeMap[ArgumentType]
		? ArgumentTypeMap[T["type"]]
		: T["optional"] extends true
		? ArgumentTypeMap[T["type"]] | undefined
		: ArgumentTypeMap[T["type"]];

export type Exec<T extends Arguments> = (params: {
	message: Message;
	args: {
		[I in keyof T]: ArgumentValue<T[I]>;
	};
	client: Client;
}) => Awaitable<any>;

type Permission = "vc";
export interface TextCommandParams<T extends Arguments> {
	aliases?: string[];
	desc: string;
	optionalPrefix?: boolean;
	args: T;
	permissions?: Permission[];
}

export interface TextCommand<T extends Arguments = Arguments>
	extends TextCommandParams<T> {
	exec: Exec<T>;
	category?: string;
	symbol: symbol;
}

export const textCommandSymbol = Symbol("text command");

const command = <T extends Arguments>(
	cmd: TextCommandParams<T>,
	exec: Exec<T>
): TextCommand<T> => ({ ...cmd, exec, symbol: textCommandSymbol });
export default command;

export const isTextCommand = (x: unknown): x is TextCommand =>
	typeof x === "object" &&
	!!x &&
	"symbol" in x &&
	x.symbol === textCommandSymbol;
