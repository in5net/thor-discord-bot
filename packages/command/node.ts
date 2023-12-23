import { type Token } from "./token";

export interface NodeMap {
	int: Token<"int">;
	float: Token<"float">;
	str: Token<"str">;
	bool: Token<"bool">;
	ident: Token<"ident">;
	command: {
		name: Array<Token<"ident">>;
		args: Node[];
	};
	commands: Array<Node<"command">>;
	eof?: never;
}

export interface Node<T extends keyof NodeMap = keyof NodeMap> {
	type: T;
	value: NodeMap[T];
}
