import { swap } from "../util";
import { descend } from "./comparisons";

export default class MaxHeap<T> extends Array<T> {
	constructor(
		array: T[],
		readonly compare = descend,
	) {
		super(...array);
	}

	insert(value: T) {
		this.unshift(value);
		this.heapify();
	}

	private heapify(i = 0, length = this.length) {
		const { compare } = this;
		const left = 2 * i + 1;
		const right = 2 * i + 2;
		let largest = i;
		if (left < length && compare(this[left]!, this[largest]!) > 0)
			largest = left;
		if (right < length && compare(this[right]!, this[largest]!) > 0)
			largest = right;
		if (largest !== i) {
			swap(this, i, largest);
			this.heapify(largest, length);
		}
	}
}
