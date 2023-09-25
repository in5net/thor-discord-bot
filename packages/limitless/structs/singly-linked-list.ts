interface Node<T> {
	value: T;
	next?: Node<T>;
}

export default class SinglyLinkedList<T> {
	node?: Node<T>;

	static fromArray<T>(values: T[]): SinglyLinkedList<T> {
		const list = new SinglyLinkedList<T>();
		let node: Node<T> | undefined;
		for (const value of values) {
			const child = { value };
			if (node) node.next = child;
			node = child;
		}

		list.node = node;
		return list;
	}

	get length() {
		let { node } = this;
		let length = 0;
		while (node) {
			length++;
			node = node.next;
		}

		return length;
	}

	*[Symbol.iterator]() {
		let { node } = this;
		while (node) {
			yield node.value;
			node = node.next;
		}
	}

	get tail(): Node<T> | undefined {
		let { node } = this;
		while (node) {
			node = node.next;
		}

		return node;
	}

	getNode(index: number): Node<T> | void {
		let current = this.node;
		let i = 0;
		while (current) {
			if (i === index) return current;
			current = current.next;
			i++;
		}
	}

	get(index: number) {
		return this.getNode(index)?.value;
	}

	set(index: number, value: T) {
		const node = this.getNode(index);
		if (!node) return;

		const { value: oldValue } = node;
		node.value = value;

		return oldValue;
	}

	push(value: T) {
		const { tail } = this;
		const node: Node<T> = { value };
		if (tail) tail.next = node;
		else this.node = node;
	}

	pop(): Node<T> | void {
		let current = this.node;
		let parent: Node<T> | undefined;
		while (current) {
			if (!current.next) {
				delete parent?.next;
				return current;
			}

			parent = current;
			current = current.next;
		}
	}

	unshift(value: T) {
		const node: Node<T> = { value };
		if (this.node) {
			node.next = this.node;
			this.node = node;
		}

		this.node = node;
	}

	shift() {
		const { node } = this;
		this.node = node?.next;
		return node;
	}
}
