import assert from "node:assert";
import test from "node:test";
import { overlap } from "./funcs";

await test("ranges overlap", () => {
	assert(overlap(0, 100, 50, 200) === 50);
	assert(overlap(100, 0, 200, 50) === 50);
});
await test("ranges don't overlap", () => {
	assert(overlap(0, 100, 200, 300) === -100);
	assert(overlap(100, 0, 300, 200) === -100);
	assert(overlap(200, 300, 0, 100) === -100);
	assert(overlap(300, 200, 100, 0) === -100);
});
