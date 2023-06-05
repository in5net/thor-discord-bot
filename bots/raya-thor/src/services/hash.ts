import { createHash } from "node:crypto";

const size = 16;

export function strTo16x16(input: string): boolean[][] {
	const hash = createHash("sha256");
	hash.update(input);
	const digest = hash.digest("hex");

	const grid = Array.from<boolean[]>({ length: size }).map(() =>
		Array.from<boolean>({ length: size }).fill(false)
	);

	digest.split("").forEach((char, i) => {
		const byte = Number.parseInt(char, 16);
		for (let index_ = 0; index_ < 4; index_++) {
			const index = i * 4 + index_;
			const x = index % size;
			const y = Math.floor(index / size);
			const bit = (byte >> index_) & 1;

			grid[x]![y] = Boolean(bit);
		}
	});

	return grid;
}
