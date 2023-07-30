/**
 * Capitalizes the first character in the word
 * @param word a string
 */
export function capitalize<T extends string>(word: T): Capitalize<T> {
	const first = word[0] || "";
	return (first.toUpperCase() + word.slice(1)) as Capitalize<T>;
}

export function pluralize<S extends string>(word: S, n: number): S | `${S}s`;
export function pluralize<S extends string, P extends string>(
	word: S,
	n: number,
	plural: P,
): S | P;
export function pluralize<S extends string, P extends string>(
	word: S,
	n: number,
	plural?: P,
): (S | `${S}s`) | (S | P) {
	if (n === 1) return word;
	if (plural) return plural;
	return `${word}s` as const;
}
