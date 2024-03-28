/* eslint-disable ts/no-empty-function */
import type Scope from "../scope";
import { type BinaryOp, type GroupingOp, type UnaryOp } from "../token";

type UnaryOpIndex = {
	[index in UnaryOp | GroupingOp]: () => Value | void;
};
type BinaryOpIndex = {
	[index in BinaryOp]: (other: Value) => Value | void;
};

export default abstract class Value implements UnaryOpIndex, BinaryOpIndex {
	static illegalUnaryOp(value: Value, operator: UnaryOp | GroupingOp): never {
		throw new Error(`Illegal operation: ${operator}${value.constructor.name}`);
	}

	static illegalBinaryOp(left: Value, operator: BinaryOp, right: Value): never {
		throw new Error(
			`Illegal operation: ${left.constructor.name} ${operator} ${right.constructor.name}`,
		);
	}

	scope?: Scope;

	toPrint(): string {
		return this.toString();
	}

	setScope(scope: Scope) {
		this.scope = scope;
		return this;
	}

	"+"(_other?: Value) {}
	"-"(_other?: Value) {}
	"√"() {}
	"∛"() {}
	"∜"() {}
	"!"() {}
	"°"() {}

	"()"() {}
	"||"() {}
	"⌊⌋"() {}
	"⌈⌉"() {}

	"*"(_other: Value) {}
	"∙"(_other: Value) {}
	"×"(_other: Value) {}
	"/"(_other: Value) {}
	"%"(_other: Value) {}
	"^"(_other: Value) {}

	abstract toString(): string;
}
