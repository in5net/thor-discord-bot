export const prefixUnaryOps = ["+", "-", "√", "∛", "∜"] as const;
export const postfixUnaryOps = ["!", "°"] as const;
export const unaryOps = [...prefixUnaryOps, ...postfixUnaryOps] as const;
export const binaryOps = ["+", "-", "*", "∙", "×", "/", "%", "^"] as const;
export const operators = [...unaryOps, ...binaryOps] as const;
export const groupings = {
  "(": ")",
  "|": "|",
  "⌊": "⌋",
  "⌈": "⌉",
} as const;

export type PrefixUnaryOp = (typeof prefixUnaryOps)[number];
export type PostfixUnaryOp = (typeof postfixUnaryOps)[number];
export type UnaryOp = (typeof unaryOps)[number];
export type BinaryOp = (typeof binaryOps)[number];
export type Operator = (typeof operators)[number];
export type LeftGrouping = keyof typeof groupings;
export type RightGrouping = (typeof groupings)[LeftGrouping];
export type Grouping = LeftGrouping | RightGrouping;
export type GroupingOp = "()" | "||" | "⌊⌋" | "⌈⌉";

export interface TokenMap {
  number: number;
  superscript: Array<Token<Exclude<keyof TokenMap, "superscript">>>;
  identifier: string;
  operator: Operator;
  grouping: Grouping;
  eof: undefined;
}

enum TokenName {
  number = "number",
  superscript = "superscript",
  identifier = "identifier",
  operator = "operator",
  grouping = "grouping",
  eof = "<eof>",
}

export default class Token<
  T extends keyof TokenMap = keyof TokenMap,
  V = TokenMap[T],
> {
  static EOF = new Token("eof", undefined);

  constructor(
    public type: T,
    public value: V,
  ) {}

  toString(): string {
    const { type, value } = this;
    return `${TokenName[type]}${value === undefined ? "" : `: ${value}`}`;
  }

  is<Type extends keyof TokenMap, Value = TokenMap[Type]>(
    type: Type,
    value?: Value,
  ): this is Token<Type, NonNullable<Value>> {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    if (this.type !== type) return false;
    if (value === undefined) return true;
    return this.value === value;
  }
}
