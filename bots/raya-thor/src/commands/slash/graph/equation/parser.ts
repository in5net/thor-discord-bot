import type Node from "./node";
import {
	BinaryOpNode,
	FuncCallNode,
	GroupingNode,
	IdentifierNode,
	NumberNode,
	UnaryOpNode,
} from "./node";
import Token, {
	type BinaryOp,
	type LeftGrouping,
	type PostfixUnaryOp,
	type PrefixUnaryOp,
	type RightGrouping,
	type UnaryOp,
	binaryOps,
	groupings,
	postfixUnaryOps,
	prefixUnaryOps,
} from "./token";

export default class Parser {
	index = -1;
	token!: Token;

	constructor(private readonly tokens: Token[]) {
		this.advance();
	}

	error(message: string): never {
		throw new Error(message);
	}

	expect(strs: string | string[]): never {
		let message: string;
		if (typeof strs === "string") message = strs;
		else
			switch (strs.length) {
				case 1: {
					message = strs[0] || "";
					break;
				}

				case 2: {
					message = `${strs[0]} or ${strs[1]}`;
					break;
				}

				default: {
					const begin = strs.slice(0, -2);
					this.error(`Expected ${begin.join(", ")}, or ${strs.at(-1)}`);
				}
			}

		this.error(`Expected ${message}`);
	}

	advance(): void {
		this.token = this.tokens[++this.index] || Token.EOF;
	}

	back(amount = 1): void {
		this.index -= amount + 1;
		this.advance();
	}

	get nextToken(): Token {
		return this.tokens[this.index + 1] || Token.EOF;
	}

	eof(): boolean {
		return this.token.type === "eof";
	}

	parse(): Node {
		if (this.eof()) return [];
		return this.expr();
	}

	expr(): Node {
		// Term (('+' | '-') term)*
		return this.binaryOp(this.term, ["+", "-"]);
	}

	term(): Node {
		// Factor (('*' | '∙' | '×' | '/' | '%') factor)* | NUMBER (!BINARY_OP)? term
		if (
			this.token.is("number") &&
			!["number", "superscript", "newline", "eof"].includes(
				this.nextToken.type,
			) &&
			!(
				this.nextToken.is("operator") &&
				binaryOps.includes(this.nextToken.value as BinaryOp)
			) &&
			!(
				this.nextToken.is("grouping") &&
				Object.values(groupings).includes(this.nextToken.value as RightGrouping)
			)
		) {
			const number = this.token;
			this.advance();

			const term = this.term();

			return new BinaryOpNode(new NumberNode(number), "*", term);
		}

		return this.binaryOp(this.factor, ["*", "∙", "×", "/", "%"]);
	}

	factor(): Node {
		// ('+' | '-') factor | power
		const { token } = this;

		if (
			token.type === "operator" &&
			prefixUnaryOps.includes((token as Token<"operator", PrefixUnaryOp>).value)
		) {
			this.advance();
			return new UnaryOpNode(
				this.factor(),
				token as Token<"operator", UnaryOp>,
			);
		}

		return this.power();
	}

	power(): Node {
		// Postfix ('^' factor)*
		return this.binaryOp(this.postfix, ["^"], this.factor);
	}

	postfix(): Node {
		// Call POSTFIX_UNARY_OP?
		const call = this.call();
		if (
			this.token.is("operator") &&
			postfixUnaryOps.includes(this.token.value as PostfixUnaryOp)
		) {
			const operator = this.token as Token<"operator", PostfixUnaryOp>;
			this.advance();
			return new UnaryOpNode(call, operator, true);
		}

		if (this.token.is("superscript")) {
			const tokens = this.token.value;
			this.advance();

			const parser = new Parser(tokens);
			const node = parser.expr();

			return new BinaryOpNode(call, "^", node);
		}

		return call;
	}

	call(): Node {
		// Prop ('(' (expr (',' expr)*)? ')')?
		const atom = this.atom();

		if (this.token.is("grouping", "(")) {
			if (!(atom instanceof IdentifierNode)) this.expect("identifier");

			this.advance();
			const args: Node[] = [];

			if (this.token.is("grouping", ")")) this.advance();
			else {
				args.push(this.expr());

				while ((this.token as Token).is("operator", ",")) {
					this.advance();
					args.push(this.expr());
				}

				if (!(this.token as Token).is("grouping", ")"))
					this.expect(["','", "')'"]);
				this.advance();
			}

			return new FuncCallNode(atom, args);
		}

		return atom;
	}

	atom(): Node {
		// (NUMBER | BOOLEAN | STRING | IDENTIFIER) | '(' expr ')' | '|' expr '|' | list_expr | if_expr | func_def
		const { token } = this;
		let rtn: Node;

		if (token.is("number")) {
			this.advance();
			rtn = new NumberNode(token);
		} else if (token.is("identifier")) {
			this.advance();
			rtn = new IdentifierNode(token);
		} else if (token.is("grouping", "(")) {
			this.advance();

			const expr = this.expr();

			if (!this.token.is("grouping", ")")) this.expect("')'");
			this.advance();

			rtn = expr;
		} else if (token.is("grouping")) {
			const leftGroupingToken = token as Token<"grouping", LeftGrouping>;
			if (!leftGroupingToken)
				this.expect(Object.keys(groupings).map(char => `'./${char}'`));
			this.advance();

			const expr = this.expr();

			const rightGrouping = groupings[leftGroupingToken.value];
			if (!this.token.is("grouping", rightGrouping))
				this.expect(`'./{rightGrouping}'`);
			const rightGroupingToken = this.token as Token<"grouping", RightGrouping>;
			this.advance();

			rtn = new GroupingNode(expr, [leftGroupingToken, rightGroupingToken]);
		} else
			this.expect([
				"number",
				"identifier",
				...Object.keys(groupings).map(char => `'./${char}'`),
			]);

		return rtn;
	}

	binaryOp(left: () => Node, operators: BinaryOp[], right = left): Node {
		let result = left.call(this);

		while (
			operators.includes((this.token as Token<"operator", BinaryOp>).value)
		) {
			const { token } = this;
			if (token.is("operator", ":") && !this.nextToken.is("number")) break;
			this.advance();
			result = new BinaryOpNode(
				result,
				(token as Token<"operator", BinaryOp>).value,
				right.call(this),
			);
		}

		return result;
	}
}
