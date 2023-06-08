import assert, { deepEqual } from "node:assert";
import test from "node:test";
import { deepCopy, deepEquals, hasOwn, shallowEquals } from "./object";

await test("hasOwn", () => {
	const object = {
		a: 1,
		b: 2,
	};
	assert(hasOwn(object, "a"));
	assert(!hasOwn(object, "c"));
});

await test("shallowEquals", () => {
	const a = {
		a: 1,
		b: 2,
	};
	const b = {
		a: 1,
		b: 2,
	};
	assert(shallowEquals(a, b));
});

await test("deepEquals", () => {
	const a = {
		a: 1,
		b: 2,
	};
	const b = {
		a: 1,
		b: 2,
	};
	assert(deepEquals(a, b));

	const c = {
		a: 1,
		b: 2,
		c: {
			a: 1,
			b: 2,
		},
	};
	const d = {
		a: 1,
		b: 2,
		c: {
			a: 1,
			b: 2,
		},
	};
	assert(deepEquals(c, d));

	const e = {
		a: 1,
		b: 2,
		c: [1, 2],
	};
	const f = {
		a: 1,
		b: 2,
		c: [1, 2],
	};
	assert(deepEquals(e, f));

	const g = {
		a: 1,
		b: 2,
		c: [1, 2, 3],
	};
	const h = {
		a: 1,
		b: 2,
		c: [1, 3],
	};
	assert(!deepEquals(g, h));
});

await test("deepCopy", () => {
	const a = {
		a: 1,
		b: 2,
	};
	const b = deepCopy(a);
	deepEqual(a, b);
});
