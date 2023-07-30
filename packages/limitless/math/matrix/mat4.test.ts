import assert from "node:assert";
import test from "node:test";
import Matrix4, { mat4 } from "./mat4";

const a = mat4([5, 7, 9, 10, 2, 3, 3, 8, 8, 10, 2, 3, 3, 3, 4, 8]);
const b = mat4([3, 10, 12, 18, 12, 1, 4, 9, 9, 10, 12, 2, 3, 12, 4, 10]);

await test("add", () => {
	const ans = Matrix4.add(a, b);
	assert(
		ans.equals([8, 17, 21, 28, 14, 4, 7, 17, 17, 20, 14, 5, 6, 15, 8, 18]),
	);
});
await test("subtract", () => {
	const ans = Matrix4.sub(a, b);
	assert(
		ans.equals([2, -3, -3, -8, -10, 2, -1, -1, -1, 0, -10, 1, 0, -9, 0, -2]),
	);
});
await test("multiply", () => {
	const ans = Matrix4.mult(a, b);
	assert(
		ans.equals([
			210, 267, 236, 271, 93, 149, 104, 149, 171, 146, 172, 268, 105, 169, 128,
			169,
		]),
	);
});
await test("determinant", () => {
	const ans = a.det();
	assert(ans === -361);
});
