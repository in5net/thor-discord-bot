import { swap } from "../util";
import { descend } from "./comparisons";

export default class SortedArray<T> extends Array<T> {
	constructor(
		array: T[],
		readonly compare = descend,
	) {
		super(...array);
		this.sort(compare);
	}

	insert(value: T) {
		this.push(value);
		const { length, compare } = this;

		let low = 0;
		let high = length - 1;
		while (low <= high) {
			const mid = Math.floor((low + high) / 2);
			if (compare(value, this[mid]!) < 0) high = mid - 1;
			else low = mid + 1;
		}

		let j = length - 1;
		while (j > low) {
			swap(this, j, j - 1);
			j--;
		}
	}
}
