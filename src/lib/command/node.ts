import { type Range } from "./range";
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
  pipedCommands: Array<Node<"$lib/command">>;
  commands: Array<Node<"pipedCommands">>;
  eof?: never;
}

export interface Node<T extends keyof NodeMap = keyof NodeMap> {
  type: T;
  value: NodeMap[T];
}

export function stringifyNode(node: Node): string {
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

    case "$lib/command": {
      const typedNode = node as Node<"$lib/command">;
      return `<command ${typedNode.value.name.value.value}>`;
    }

    case "pipedCommands": {
      const typedNode = node as Node<"pipedCommands">;
      return typedNode.value.map(stringifyNode).join(" | ");
    }

    case "$lib/commands": {
      return "<commands>";
    }

    case "eof": {
      return "<eof>";
    }
  }
}

export function getNodeRange(node: Node): Range {
  switch (node.type) {
    case "int":
    case "float":
    case "str":
    case "bool":
    case "ident": {
      const typedNode = node as Node<
        "int" | "float" | "str" | "bool" | "ident"
      >;
      return typedNode.value.range;
    }

    case "$lib/command": {
      const typedNode = node as Node<"$lib/command">;
      return [
        typedNode.value.name.value.range[0],
        getNodeRange(typedNode.value.args.at(-1) || typedNode.value.name)[1],
      ];
    }

    case "pipedCommands": {
      const typedNode = node as Node<"pipedCommands">;
      const first = typedNode.value.at(0);
      const last = typedNode.value.at(-1);
      if (!first) return [0, 0];
      if (!last) return getNodeRange(first);
      return [getNodeRange(first)[0], getNodeRange(last)[1]];
    }

    case "$lib/commands": {
      const typedNode = node as Node<"$lib/commands">;
      const first = typedNode.value.at(0);
      const last = typedNode.value.at(-1);
      if (!first) return [0, 0];
      if (!last) return getNodeRange(first);
      return [getNodeRange(first)[0], getNodeRange(last)[1]];
    }

    case "eof": {
      return [0, 0];
    }
  }
}
