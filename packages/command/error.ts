import { type Range } from "./range";

export class CommandError extends Error {
	constructor(
		message: string,
		readonly range: Range,
	) {
		super(message);
	}
}
