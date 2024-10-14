import type Token from "./token";
import {
  type BinaryOp,
  type LeftGrouping,
  type RightGrouping,
  type UnaryOp,
} from "./token";

export default abstract class Node {
  abstract toString(): string;
}

export class NumberNode implements Node {
  constructor(readonly token: Token<"number">) {}

  toString(): string {
    return this.token.value.toString();
  }
}

export class IdentifierNode implements Node {
  constructor(readonly token: Token<"identifier">) {}

  toString(): string {
    return this.token.value;
  }
}

export class UnaryOpNode implements Node {
  constructor(
    readonly node: Node,
    readonly operator: Token<"operator", UnaryOp>,
    readonly postfix = false,
  ) {}

  toString(): string {
    const operatorString = this.operator.value;
    if (this.postfix) return `(${this.node}${operatorString})`;
    return `(${operatorString}${this.node})`;
  }
}

export class BinaryOpNode implements Node {
  constructor(
    readonly left: Node,
    readonly operator: BinaryOp,
    readonly right: Node,
  ) {}

  toString(): string {
    return `(${this.left} ${this.operator} ${this.right})`;
  }
}

export class FuncCallNode implements Node {
  constructor(
    readonly name: IdentifierNode,
    readonly args: Node[],
  ) {}

  toString(): string {
    const { name } = this;
    return `(${name.token.value}(${this.args.join(", ")}))`;
  }
}

export class GroupingNode implements Node {
  constructor(
    readonly node: Node,
    readonly groupings: [
      Token<"grouping", LeftGrouping>,
      Token<"grouping", RightGrouping>,
    ],
  ) {}

  toString(): string {
    const [l, r] = this.groupings;
    return `${l}${this.node}${r}`;
  }
}
