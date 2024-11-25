import { CommandError } from "./error";
import { type Str, type Token } from "./token";

const WHITESPACE = /[\t\r ]/;
const DIGITS = /\d/;
const ESCAPE_CHARS: Record<string, string | undefined> = {
  "\\": "\\",
  "n": "\n",
  "r": "\r",
  "t": "\t",
};

const EOF = "\0";

export class Lexer {
  index = 0;
  char: string;

  constructor(private readonly text: string) {
    this.char = text[0] || EOF;
  }

  error(message: string, start: number): never {
    throw new CommandError(message, [start, this.index]);
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
  }

  nextToken(): Token {
    while (WHITESPACE.test(this.char)) {
      this.advance();
    }

    const { char } = this;
    const start = this.index;
    switch (char) {
      case "\n": {
        this.advance();
        return {
          type: "newline",
          value: undefined,
          range: [start, this.index],
        };
      }

      case '"': {
        return this.string();
      }

      case "-": {
        this.advance();
        return {
          type: "minus",
          value: undefined,
          range: [start, this.index],
        };
      }

      case "|": {
        this.advance();
        return {
          type: "pipe",
          value: undefined,
          range: [start, this.index],
        };
      }

      case "\0": {
        return {
          type: "eof",
          value: undefined,
          range: [start, this.index],
        };
      }

      default: {
        if (DIGITS.test(char)) {
          return this.number();
        }
        if (/\S/.test(char)) {
          return this.word();
        }
        this.error(`Invalid character '${char}'`, this.index);
      }
    }
  }

  number(): Token<"int" | "float"> {
    const start = this.index;

    let str = this.char;
    let decimals = 0;
    this.advance();

    while (DIGITS.test(this.char) || [".", "_"].includes(this.char)) {
      if (this.char === "_") {
        continue;
      }
      if (this.char === "." && ++decimals > 1) {
        break;
      }

      str += this.char;
      this.advance();
    }

    return {
      type: decimals ? "float" : "int",
      value: decimals ? Number.parseFloat(str) : Number.parseInt(str),
      range: [start, this.index],
    };
  }

  string(): Token<"str"> {
    const start = this.index;
    this.advance();

    const fragments: Str = [];
    let str = "";
    let escapeCharacter = false;

    let fragmentStart = this.index;
    while (!this.eof() && (this.char !== '"' || escapeCharacter)) {
      if (escapeCharacter) {
        str += ESCAPE_CHARS[this.char] || this.char;
        escapeCharacter = false;
      } else if (this.char === "\\") {
        escapeCharacter = true;
      } else if (this.char === "{") {
        fragments.push({
          type: "str",
          value: str,
          range: [fragmentStart, this.index],
        });
        str = "";
        this.advance();
        fragmentStart = this.index;

        const tokens: Token[] = [];
        let token = this.nextToken();
        while (!this.eof() && !["}", '"'].includes(this.char as string)) {
          tokens.push(token);
          token = this.nextToken();
        }

        tokens.push(token);
        if ((this.char as string) !== "}") {
          this.error(
            "When putting expressions in strings, you must wrap the expression in curly braces '{}'. It seems like you forgot the ending '}'.",
            start,
          );
        }
        fragments.push(tokens);
      } else {
        str += this.char;
      }

      this.advance();
    }

    if (str) {
      fragments.push({
        type: "str",
        value: str,
        range: [fragmentStart, this.index],
      });
    }

    if (this.char !== '"') {
      this.error(
        `Strings must start and end with '"'. It seems like you forgot the ending '"'.`,
        start,
      );
    }
    this.advance();
    return {
      type: "str",
      value: fragments,
      range: [start, this.index],
    };
  }

  word(): Token {
    const start = this.index;

    let str = this.char;
    this.advance();

    while (/\S/.test(this.char) && !this.eof()) {
      str += this.char;
      this.advance();
    }

    const end = this.index;
    if (["true", "false"].includes(str)) {
      return {
        type: "bool",
        value: str === "true",
        range: [start, end],
      };
    }
    return { type: "ident", value: str, range: [start, end] };
  }
}
