import { type Range } from "./range";

export type Str = string | Array<Token<"str"> | Token[]>;

export interface TokenMap {
	int: number;
	float: number;
	str: Str;
	bool: boolean;
	ident: string;
	minus?: never;
	newline?: never;
	eof?: never;
}

export interface Token<T extends keyof TokenMap = keyof TokenMap> {
	type: T;
	value: TokenMap[T];
	range: Range;
}
