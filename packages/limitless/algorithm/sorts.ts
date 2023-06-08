import { swap } from "../util";

const gapFactor = 1.3;

type SortingGenerator = Generator<number[], void>;

export function* shuffleGen<T>(array: T[]): SortingGenerator {
	const { length } = array;
	for (let i = 0; i < length; i++) {
		const j = Math.floor(Math.random() * length);
		swap(array, i, j);
		yield [i, j];
	}
}

export function* bubble<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	for (let i = 0; i < length; i++) {
		for (let j = 0; j < length - 1 - i; j++) {
			if (compare(array[j]!, array[j + 1]!) > 0) swap(array, j, j + 1);
			yield [j, j + 1];
		}
	}
}

export function* cocktail<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	let start = 0;
	let end = length - 1;
	while (start < end) {
		for (let i = start; i < end; i++) {
			if (compare(array[i]!, array[i + 1]!) > 0) swap(array, i, i + 1);
			yield [i, i + 1];
		}

		end--;
		for (let i = end; i > start; i--) {
			if (compare(array[i]!, array[i - 1]!) < 0) swap(array, i, i - 1);
			yield [i, i - 1];
		}

		start++;
	}
}

export function* selection<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	for (let i = 0; i < length; i++) {
		let min = i;
		for (let j = i + 1; j < length; j++) {
			if (compare(array[j]!, array[min]!) < 0) min = j;
			yield [j];
		}

		if (min !== i) swap(array, i, min);
		yield [i, min];
	}
}

export function* insertion<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	for (let i = 1; i < length; i++) {
		let j = i;
		while (j > 0 && compare(array[j]!, array[j - 1]!) < 0) {
			swap(array, j, j - 1);
			j--;
			yield [j, j - 1];
		}
	}
}

export function* quick<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	function* sort(left: number, right: number): SortingGenerator {
		if (left >= right) return;
		const pivot = array[left];
		let i = left + 1;
		let j = right;
		while (i <= j) {
			while (i <= right && compare(array[i]!, pivot!) <= 0) i++;
			while (j > left && compare(array[j]!, pivot!) > 0) j--;
			if (i < j) swap(array, i, j);
			yield [left, i, j];
		}

		swap(array, left, j);
		yield* sort(left, j - 1);
		yield* sort(j + 1, right);
	}

	yield* sort(0, length - 1);
}

export function* shell<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	let gap = Math.floor(length / 2);
	while (gap > 0) {
		for (let i = gap; i < length; i++) {
			let j = i;
			while (j >= gap && compare(array[j]!, array[j - gap]!) < 0) {
				swap(array, j, j - gap);
				j -= gap;
				yield [j, j - gap];
			}
		}

		gap = Math.floor(gap / gapFactor);
	}
}

export function* merge<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	function* mergeSort(left: number, right: number): SortingGenerator {
		if (left >= right) return;
		const mid = Math.floor((left + right) / 2);
		yield* mergeSort(left, mid);
		yield* mergeSort(mid + 1, right);
		const temporary = Array.from<T>({ length: right - left + 1 });
		let i = left;
		let j = mid + 1;
		let k = 0;
		while (i <= mid && j <= right) {
			if (compare(array[i]!, array[j]!) < 0) {
				temporary[k] = array[i]!;
				i++;
			} else {
				temporary[k] = array[j]!;
				j++;
			}

			k++;
			yield [i, j];
		}

		while (i <= mid) {
			temporary[k] = array[i]!;
			i++;
			k++;
			yield [i];
		}

		while (j <= right) {
			temporary[k] = array[j]!;
			j++;
			k++;
			yield [j];
		}

		for (const [m, element] of temporary.entries()) {
			array[left + m] = element;
			yield [left + m];
		}
	}

	yield* mergeSort(0, length - 1);
}

export function* heap<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	function* heapify(i: number, length: number): SortingGenerator {
		const left = 2 * i + 1;
		const right = 2 * i + 2;
		let largest = i;
		if (left < length && compare(array[left]!, array[largest]!) > 0)
			largest = left;
		if (right < length && compare(array[right]!, array[largest]!) > 0)
			largest = right;
		if (largest !== i) {
			swap(array, i, largest);
			yield [i, largest];
			yield* heapify(largest, length);
		}
	}

	for (let i = Math.floor(length / 2); i >= 0; i--) {
		yield* heapify(i, length);
	}

	for (let i = length - 1; i > 0; i--) {
		swap(array, 0, i);
		yield [0, i];
		yield* heapify(0, i);
	}
}

export function* binaryInsertion<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	for (let i = 1; i < length; i++) {
		const key = array[i]!;
		let low = 0;
		let high = i - 1;
		while (low <= high) {
			const mid = Math.floor((low + high) / 2);
			if (compare(key, array[mid]!) < 0) high = mid - 1;
			else low = mid + 1;
			yield [i, mid];
		}

		let j = i;
		while (j > low) {
			swap(array, j, j - 1);
			j--;
			yield [j, j - 1];
		}
	}
}

export function* comb<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	let gap = Math.floor(length / 2);
	while (gap > 0) {
		for (let i = 0; i < length; i++) {
			for (let j = i; j < length; j += gap) {
				if (compare(array[j]!, array[i]!) < 0) {
					swap(array, i, j);
					yield [i, j];
				}
			}
		}

		gap = Math.floor(gap / gapFactor);
	}
}

export function* gnome<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	let i = 0;
	while (i < length) {
		if (!i) i++;
		if (compare(array[i]!, array[i - 1]!) > 0) i++;
		else {
			swap(array, i, i - 1);
			yield [i, i - 1];
			i--;
		}
	}
}

export function* cycle<T>(
	array: T[],
	compare: (a: T, b: T) => number
): SortingGenerator {
	const { length } = array;
	for (let start = 0; start < length - 1; start++) {
		let item = array[start]!;

		let pos = start;
		for (let i = start + 1; i < length; i++) {
			if (compare(array[i]!, item) < 0) pos++;
			yield [start, i];
		}

		if (pos === start) continue;

		while (item === array[pos]) pos++;
		[array[pos], item] = [item, array[pos]!];
		yield [start, pos];

		while (pos !== start) {
			pos = start;
			for (let i = start + 1; i < length; i++) {
				if (compare(array[i]!, item) < 0) pos++;
				yield [start, i];
			}

			while (item === array[pos]) pos++;
			[array[pos], item] = [item, array[pos]!];
			yield [start, pos];
		}
	}
}
