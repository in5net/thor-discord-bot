import assert from "node:assert";
import test from "node:test";
import { toSuffix } from "./number";

await test("number", () => {
	assert(toSuffix(14) === "14");
	assert(toSuffix(123_456) === "123.456 thousand");
	assert(toSuffix(3.6e15) === "3.6 quadrillion");
	assert(toSuffix(3.6e15, true) === "3.6 qd");
	assert(toSuffix(20e42, true) === "20 tD");
});
