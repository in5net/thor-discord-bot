/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new-wrappers */
import type Node from "./node";
import {
	type BinaryOpNode,
	type FuncCallNode,
	type GroupingNode,
	type IdentifierNode,
	type NumberNode,
	type UnaryOpNode,
} from "./node";
import type Scope from "./scope";
import { type GroupingOp } from "./token";
import Value, { Function, Number } from "./values/mod";

type NodeName =
	| "BinaryOpNode"
	| "FuncCallNode"
	| "GroupingNode"
	| "IdentifierNode"
	| "NumberNode"
	| "UnaryOpNode";
type NodeIndex = `visit${NodeName}`;

type VisitFunc = (node: any, scope: Scope) => Value;
type ExecuteIndex = {
	[index in NodeIndex]: VisitFunc;
};

export default class Interpreter implements ExecuteIndex {
	returnValue: Value | undefined;

	visit(node: Node, scope: Scope): Value {
		const methodName = `visit${node.constructor.name}`;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		const method = this[methodName] as VisitFunc;
		return method.call(this, node, scope);
	}

	error(message: string): never {
		throw new Error(message);
	}

	visitNumberNode({ token: { value } }: NumberNode): Number {
		return new Number(value);
	}

	visitIdentifierNode(
		{ token: { value: name } }: IdentifierNode,
		scope: Scope
	): Value {
		const value = scope.get(name);
		if (!value) this.error(`'./{name}' is not defined`);
		return value;
	}

	visitUnaryOpNode(
		{ node, operator: { value: operator } }: UnaryOpNode,
		scope: Scope
	): Value {
		const value = this.visit(node, scope);

		const func = value[operator];
		if (!func) Value.illegalUnaryOp(value, operator);
		const returnValue = func.call(value) as Value | undefined;
		if (!returnValue) Value.illegalUnaryOp(value, operator);
		return returnValue;
	}

	visitBinaryOpNode(
		{ left, operator, right }: BinaryOpNode,
		scope: Scope
	): Value {
		const leftValue = this.visit(left, scope);
		const rightValue = this.visit(right, scope);

		const func = leftValue[operator];
		if (!func) Value.illegalBinaryOp(leftValue, operator, rightValue);
		const value = func.call(leftValue, rightValue) as Value | undefined;
		if (!value) Value.illegalBinaryOp(leftValue, operator, rightValue);
		return value;
	}

	visitFuncCallNode({ name, args }: FuncCallNode, scope: Scope): Value {
		const func = this.visit(name, scope);
		if (!(func instanceof Function)) this.error(`${name} is not a function`);
		const argValues = args.map(arg => this.visit(arg, scope));
		const argNums = argValues.map(arg =>
			arg instanceof Number ? arg.value : globalThis.Number.NaN
		);
		const value = func.execute(...argNums);
		return new Number(value);
	}

	visitGroupingNode(
		{ node, groupings: [left, right] }: GroupingNode,
		scope: Scope
	): Value {
		const value = this.visit(node, scope);
		const operator = (left.value + right.value) as Exclude<GroupingOp, "[]">;

		const func = value[operator];
		if (!func) Value.illegalUnaryOp(value, operator);
		const returnValue = func.call(value) as Value | undefined;
		if (!returnValue) Value.illegalUnaryOp(value, operator);
		return returnValue;
	}
}
