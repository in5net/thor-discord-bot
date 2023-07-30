import assert from "node:assert";
import test from "node:test";
import Matrix, { mat } from "./mat";

const a = mat(4, 3).set([
	[1, 5, 4],
	[8, 0, 4],
	[6, 4, 8],
	[4, 5, 5],
]);
const b = mat([
	[1, 2],
	[3, 3],
	[0, 8],
]);

await test("multiply", () => {
	const ans = Matrix.mult(a, b);
	ans.log();
	assert(
		ans.equals([
			[16, 49],
			[8, 48],
			[18, 88],
			[19, 63],
		]),
	);
});
