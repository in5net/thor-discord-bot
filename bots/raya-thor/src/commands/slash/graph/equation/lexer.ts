import Token, {
	groupings,
	type Operator,
	operators,
	type TokenMap,
} from "./token";

const WHITESPACE = /[ \t\r]/;
const DIGITS = /\d/;
// Letters, underscore, $ & greek letters
const LETTERS = /[a-zA-Z_$\u0391-\u03C9∞]/;
const SUPERSCRIPT =
	"ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾";
const NORMALSCRIPT =
	"abcdefghijklmnoprstuvwxyzABCDEFGHIJKLMNOPRSTUVWXYZ0123456789+-=()";

const EOF = "\0";

export default class Lexer {
	index = 0;
	char: string;

	constructor(private readonly text: string) {
		this.char = text[0] || EOF;
	}

	error(message: string): never {
		throw new Error(message);
	}

	lex(): Token[] {
		const tokens: Token[] = [];
		let token = this.nextToken();
		while (!token.is("eof")) {
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
	}

	get nextChar(): string {
		return this.text[this.index + 1] || EOF;
	}

	nextToken(): Token {
		while (!this.eof()) {
			const { char } = this;
			if (WHITESPACE.test(char)) this.advance();
			else if (DIGITS.test(char)) return this.number();
			else if (SUPERSCRIPT.includes(char)) return this.superscript();
			else if (LETTERS.test(char)) return this.word();
			else if (operators.includes(char as Operator)) return this.operator();
			else if (Object.entries(groupings).flat().includes(char)) {
				this.advance();
				return new Token("grouping", char);
			} else this.error(`Illegal character './{char}'`);
		}

		return Token.EOF;
	}

	superscript(): Token<"superscript"> {
		let string = "";

		let index = SUPERSCRIPT.indexOf(this.char);
		while (index >= 0) {
			const normalChar = NORMALSCRIPT[index] || "";
			string += normalChar;
			this.advance();
			index = SUPERSCRIPT.indexOf(this.char);
		}

		const lexer = new Lexer(string);
		const tokens = lexer.lex() as Array<
			Token<Exclude<keyof TokenMap, "superscript">>
		>;
		tokens.pop();

		return new Token("superscript", tokens);
	}

	number(): Token<"number"> {
		let string_ = this.char;
		let decimals = 0;
		this.advance();

		while (DIGITS.test(this.char) || [".", "_"].includes(this.char)) {
			if (this.char === "_") continue;
			if (this.char === "." && ++decimals > 1) break;

			string_ += this.char;
			this.advance();
		}

		return new Token("number", Number.parseFloat(string_));
	}

	word(): Token<"identifier"> {
		let string_ = this.char;
		this.advance();

		while ([LETTERS, DIGITS].some(regex => regex.test(this.char))) {
			string_ += this.char;
			this.advance();
		}

		return new Token("identifier", string_);
	}

	operator(): Token<"operator"> {
		const string_ = this.char;
		this.advance();

		return new Token("operator", string_ as Operator);
	}
}
