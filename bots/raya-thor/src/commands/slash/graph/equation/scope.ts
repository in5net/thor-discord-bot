import type Value from "./values";

export default class Scope {
	symbols = new Map<string, Value>();

	add(name: string, value: Value): void {
		this.symbols.set(name, value);
	}

	get(name: string): Value | undefined {
		return this.symbols.get(name);
	}

	set(name: string, value: Value): void {
		// TODO: search parent first, then set
		this.symbols.set(name, value);
	}

	remove(name: string): void {
		this.symbols.delete(name);
	}
}
