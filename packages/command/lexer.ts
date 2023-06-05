import { Position } from "./position";
import { type Str, type Token, booleans } from "./token";

const WHITESPACE = /[ \t\r]/;
const DIGITS = /\d/;
const ESCAPE_CHARS: Record<string, string | undefined> = {
	"\\": "\\",
	n: "\n",
	r: "\r",
	t: "\t",
};

const EOF = "\0";

export class LexerError extends Error {
	constructor(
		readonly message: string,
		readonly start: Position,
		readonly end: Position
	) {
		super(message);
	}
}

export default class Lexer {
	index = 0;
	char: string;
	position: Position;

	constructor(private readonly text: string) {
		this.char = text[0] || EOF;
		this.position = new Position(text);
	}

	error(message: string, start: Position): never {
		throw new LexerError(message, start, this.position.copy());
	}

	lex(): Token[] {
		const tokens: Token[] = [];
		let token = this.nextToken();
		while (token.type !== "eof") {
			tokens.push(token);
			token = this.nextToken();
		}

		tokens.push(token);
		return tokens;
	}

	eof(): boolean {
		return this.char === EOF;
	}

	advance(): void {
		this.char = this.text[++this.index] || EOF;
		this.position.advance();
	}

	get nextChar(): string {
		return this.text[this.index + 1] || EOF;
	}

	nextToken(): Token {
		while (!this.eof()) {
			const { char } = this;
			if (WHITESPACE.test(char)) this.advance();
			else if (char === "\n") {
				const start = this.position.copy();
				this.advance();
				return {
					type: "newline",
					value: undefined,
					start,
					end: this.position.copy(),
				};
			} else if (DIGITS.test(char)) return this.number();
			else if (char === '"') return this.string();
			else if (/\S/.test(char)) return this.word();
			else this.error(`Illegal character '${char}'`, this.position.copy());
		}

		return {
			type: "eof",
			value: undefined,
			start: Position.EOF,
			end: Position.EOF,
		};
	}

	number(): Token<"int" | "float"> {
		const start = this.position.copy();

		let str = this.char;
		let decimals = 0;
		this.advance();

		while (DIGITS.test(this.char) || [".", "_"].includes(this.char)) {
			if (this.char === "_") continue;
			if (this.char === "." && ++decimals > 1) break;

			str += this.char;
			this.advance();
		}

		return {
			type: decimals ? "float" : "int",
			value: decimals ? Number.parseFloat(str) : Number.parseInt(str),
			start,
			end: this.position.copy(),
		};
	}

	string(): Token<"str"> {
		const start = this.position.copy();
		this.advance();

		const fragments: Str = [];
		let str = "";
		let escapeCharacter = false;

		let fragmentStart = this.position.copy();
		while (!this.eof() && (this.char !== '"' || escapeCharacter)) {
			if (escapeCharacter) {
				str += ESCAPE_CHARS[this.char] || this.char;
				escapeCharacter = false;
			} else if (this.char === "\\") escapeCharacter = true;
			else if (this.char === "{") {
				fragments.push({
					type: "str",
					value: str,
					start: fragmentStart,
					end: this.position.copy(),
				});
				str = "";
				this.advance();
				fragmentStart = this.position.copy();

				const tokens: Token[] = [];
				let token = this.nextToken();
				while (!this.eof() && !["}", '"'].includes(this.char as string)) {
					tokens.push(token);
					token = this.nextToken();
				}

				tokens.push(token);
				if ((this.char as string) !== "}")
					this.error(
						"When putting expressions in strings, you must wrap the expression in curly braces '{}'. It seems like you forgot the ending '}",
						start
					);
				fragments.push(tokens);
			} else str += this.char;

			this.advance();
		}

		if (str)
			fragments.push({
				type: "str",
				value: str,
				start: fragmentStart,
				end: this.position.copy(),
			});

		if (this.char !== '"')
			this.error(
				`Strings must start and end with '"'. It seems like you forgot the ending '"'.`,
				start
			);
		this.advance();
		return { type: "str", value: fragments, start, end: this.position.copy() };
	}

	word(): Token {
		const start = this.position.copy();

		let str = this.char;
		this.advance();

		while (/\S/.test(this.char)) {
			str += this.char;
			this.advance();
		}

		const end = this.position.copy();
		if (booleans.includes(str as (typeof booleans)[number]))
			return { type: "bool", value: str === "true", start, end };
		return { type: "ident", value: str, start, end };
	}
}
