import { type Position } from "./position";

export type Str = string | Array<Token<"str"> | Token[]>;

export const booleans = ["true", "false"] as const;

export interface TokenMap {
	int: number;
	float: number;
	str: Str;
	bool: boolean;
	ident: string;
	newline?: never;
	eof?: never;
}

export interface Token<T extends keyof TokenMap = keyof TokenMap> {
	type: T;
	value: TokenMap[T];
	start: Position;
	end: Position;
}
