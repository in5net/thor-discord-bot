export function reverse(str: string): string {
	return str.split("").reverse().join();
}

export function replace(
	str: string,
	replacements: Record<string, string>,
): string {
	const regex = new RegExp(Object.keys(replacements).join("|"), "g");
	return str.replace(regex, matched => replacements[matched] || "");
}
