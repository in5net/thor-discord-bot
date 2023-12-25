import { type Token } from "./token";

export interface NodeMap {
	int: Token<"int">;
	float: Token<"float">;
	str: Token<"str">;
	bool: Token<"bool">;
	ident: Token<"ident">;
	command: {
		name: Node<"ident">;
		args: Node[];
	};
	commands: Array<Node<"command">>;
	eof?: never;
}

export interface Node<T extends keyof NodeMap = keyof NodeMap> {
	type: T;
	value: NodeMap[T];
}

export function stringifyNode(node: Node) {
	switch (node.type) {
		case "int":
		case "float":
		case "str":
		case "bool":
		case "ident": {
			const typedNode = node as Node<
				"int" | "float" | "str" | "bool" | "ident"
			>;
			return typedNode.value.value.toString();
		}

		case "command": {
			const typedNode = node as Node<"command">;
			return `<command ${typedNode.value.name.value.value}>`;
		}

		case "commands": {
			return "<commands>";
		}

		case "eof": {
			return "<eof>";
		}
	}
}
