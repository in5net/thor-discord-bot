import { CommandError } from "./error";
import { type Node } from "./node";
import { Range } from "./range";
import { type Token } from "./token";

export class Parser {
	index = -1;
	token!: Token;

	constructor(private readonly tokens: Token[]) {
		this.advance();
	}

	error(message: string, start: number): never {
		throw new CommandError(message, new Range(start, this.token.range.end));
	}

	expect(strs: string | string[], start: number): never {
		let message: string;
		if (typeof strs === "string") message = strs;
		else
			switch (strs.length) {
				case 1: {
					message = strs[0]!;
					break;
				}

				case 2: {
					message = `${strs[0]} or ${strs[1]}`;
					break;
				}

				default: {
					const begin = strs.slice(0, -2);
					this.error(`Expected ${begin.join(", ")}, or ${strs.at(-1)}`, start);
				}
			}

		this.error(`Expected ${message}`, start);
	}

	advance() {
		this.token = this.tokens[++this.index] || {
			type: "eof",
			value: undefined,
			range: new Range(this.index, this.index + 1),
		};
	}

	skipNewlines() {
		let newlines = 0;
		while (this.token.type === "newline") {
			this.advance();
			newlines++;
		}

		return newlines;
	}

	eof() {
		return this.token.type === "eof";
	}

	parse(): Node<"commands"> {
		const commands: Node[] = [];

		this.skipNewlines();

		commands.push(this.command());

		let moreStatements = true;

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const newlines = this.skipNewlines();
			if (newlines === 0) moreStatements = false;

			if (!moreStatements) break;

			const statement = this.command();
			if (!statement) {
				moreStatements = false;
				continue;
			}

			commands.push(statement);
		}

		return { type: "commands", value: commands };
	}

	command(): Node<"command"> {
		if (this.token.type === "minus") {
			this.advance();
		}

		const { start } = this.token.range;

		const name = this.atom();
		if (name.type !== "ident") {
			this.error("Expected command name", start);
		}

		const args: Node[] = [];
		while (!this.eof()) {
			const arg = this.atom();
			args.push(arg);
		}

		return { type: "command", value: { name, args } };
	}

	atom(): Node {
		const { token } = this;
		switch (token.type) {
			case "int": {
				this.advance();
				return { type: "int", value: token };
			}

			case "float": {
				this.advance();
				return { type: "float", value: token };
			}

			case "str": {
				this.advance();
				return { type: "str", value: token };
			}

			case "bool": {
				this.advance();
				return { type: "bool", value: token };
			}

			case "ident": {
				this.advance();
				return { type: "ident", value: token };
			}

			default: {
				this.error(
					"Expected number, string, boolean, or identifier",
					token.range.start,
				);
			}
		}
	}
}
