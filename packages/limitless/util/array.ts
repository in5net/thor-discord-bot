export function zip<T, U>(array1: T[], array2: U[]): Array<[T, U]> {
	const length = Math.min(array1.length, array2.length);
	const array = Array.from<[T, U]>({ length });
	for (let i = 0; i < length; i++) {
		array[i] = [array1[i]!, array2[i]!];
	}

	return array;
}

export function unzip<T, U>(array: Array<[T, U]>): [T[], U[]] {
	const array1 = Array.from<T>({ length: array.length });
	const array2 = Array.from<U>({ length: array.length });
	for (const [i, [a, b]] of array.entries()) {
		array1[i] = a;
		array2[i] = b;
	}

	return [array1, array2];
}

export function swap<T>(array: T[], i: number, j: number): T[] {
	[array[i], array[j]] = [array[j]!, array[i]!];
	return array;
}

export function shuffle<T>(array: T[]): T[] {
	for (let i = 0, { length } = array; i < length; i++) {
		const j = randomInt(i, length);
		swap(array, i, j);
	}

	return array;
}

export function remove<T>(array: T[], item: T): boolean {
	const index = array.indexOf(item);
	if (index === -1) return false;
	array.splice(index, 1);
	return true;
}

export function unorderedRemove<T>(array: T[], index: number): T[] {
	swap(array, index, array.length - 1);
	array.pop();
	return array;
}

export function chunk<T>(array: ConcatArray<T>, size: number): T[][] {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}

	return result;
}

export function intersection<T>(array1: T[], array2: T[]): T[] {
	return array1.filter(item => array2.includes(item));
}

export function union<T>(array1: T[], array2: T[]): T[] {
	return [...array1, ...array2.filter(item => !array1.includes(item))];
}

export function min(array: number[]): number {
	let min = Number.POSITIVE_INFINITY;
	for (const x of array) {
		if (x < min) min = x;
	}

	return min;
}

export function max(array: number[]): number {
	let max = Number.NEGATIVE_INFINITY;
	for (const x of array) {
		if (x > max) max = x;
	}

	return max;
}

export function sum(array: number[]): number {
	return array.reduce((sum, current) => sum + current, 0);
}

export function mean(array: number[]): number {
	const { length } = array;
	if (!length) return 0;
	return sum(array) / length;
}

export const average = mean;

export function median(array: number[]): number {
	const { length } = array;
	if (!length) return 0;
	const sorted = [...array].sort((a, b) => a - b);
	if (length % 2) return sorted[length / 2]!;
	return (sorted[length / 2 - 1]! + sorted[length / 2]!) / 2;
}

export function mode(array: number[]): number[] {
	const counts: Record<number, number> = {};
	for (const n of array) {
		if (counts[n]) counts[n]++;
		else counts[n] = 1;
	}

	const sortedCounts = Object.entries(counts).sort((a, b) => a[1] - b[1]);
	const sortedNumbers = sortedCounts.map(n => n[1]);
	return sortedNumbers.filter(n => n === sortedCounts[0]![1]);
}

export function range(max: number): Generator<number>;
export function range(
	min: number,
	max: number,
	step?: number
): Generator<number>;
export function range(max: number): number;
export function* range(
	minOrMaxOrArray: number | number[],
	maxValue?: number,
	step = 1
): number | Generator<number> {
	if (Array.isArray(minOrMaxOrArray))
		return max(minOrMaxOrArray) - min(minOrMaxOrArray);
	if (maxValue !== undefined) {
		const absStep = Math.abs(step);
		if (maxValue > minOrMaxOrArray) {
			for (let i = 0; i <= maxValue; i += absStep) {
				yield i;
			}
		} else {
			for (let i = maxValue; i >= minOrMaxOrArray; i -= absStep) {
				yield i;
			}
		}
	}

	return range(0, minOrMaxOrArray);
}

export function variance(array: number[]): number {
	const m = mean(array);
	return mean(array.map(n => (n - m) ** 2));
}

export function stddev(array: number[]): number {
	return Math.sqrt(variance(array));
}

export function meanAbsDev(array: number[]): number {
	const m = mean(array);
	return mean(array.map(n => n - m));
}

export function pick<T>(array: T[], numberItems: number): T[] {
	if (!array.length || !numberItems) return [];
	return Array.from<T>({ length: numberItems }).map(
		() => array[randomInt(array.length)]!
	);
}

export function arraysEqual<T>(a: ArrayLike<T>, b: ArrayLike<T>): boolean {
	if (a.length !== b.length) return false;
	// eslint-disable-next-line unicorn/no-for-loop
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}

	return true;
}

export function dedupe<T extends { [K in keyof T]: T[K] }>(
	array: readonly T[],
	key: keyof T
): T[] {
	const array_ = [...array];
	const values = new Set<string>();
	for (let i = array_.length - 1; i >= 0; i--) {
		const item = array_[i]!;
		const value = item[key];
		if (values.has(value)) array_.splice(i, 1);
		else values.add(value);
	}

	return array_;
}

function randomInt(min: number, max?: number): number {
	if (!max) return Math.floor(Math.random() * min);
	const Min = Math.min(min, max);
	return Math.floor((Math.max(min, max) - Min) * Math.random() + Min);
}
