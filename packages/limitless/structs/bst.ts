import { descend } from "./comparisons";

interface Node<T> {
	value: T;
	left?: Node<T>;
	right?: Node<T>;
}

export default class BST<T> {
	tree?: Node<T>;

	constructor(readonly compare = descend) {}

	has(value: T) {
		let { tree: node, compare } = this;
		while (node) {
			const comparison = compare(value, node.value);
			if (!comparison) return true;
			node = comparison < 0 ? node.left : node.right;
		}

		return false;
	}

	insert(value: T) {
		const { tree, compare } = this;
		const node: Node<T> = { value };
		if (tree) {
			let parent = tree;
			while (parent) {
				const comparison = compare(value, parent.value);
				const { left, right } = parent;
				if (comparison < 0) {
					if (left) parent = left;
					else {
						parent.left = node;
						return;
					}
				} else if (right) parent = right;
				else {
					parent.right = node;
					return;
				}
			}
		} else {
			this.tree = node;
		}
	}
}
