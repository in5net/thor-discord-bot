/* eslint-disable no-new-wrappers */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */

import type { BinaryOp } from '../token';
import Function from './function';
import Value from './value';

export default class Number extends Value {
  constructor(public value: number) {
    super();
  }

  toString(): string {
    return this.value.toString();
  }

  operatorFunc(func: Function, op: BinaryOp): Function {
    return new Function(x => {
      const value = this[op](new Number(func.execute(x)));
      return value instanceof Number ? value.value : NaN;
    });
  }

  '+'(other?: Value) {
    if (other instanceof Number) return new Number(this.value + other.value);
    if (other instanceof Function) return this.operatorFunc(other, '+');
    return this;
  }

  '-'(other?: Value) {
    if (other instanceof Number) return new Number(this.value - other.value);
    if (other instanceof Function) return this.operatorFunc(other, '-');
    return new Number(-this.value);
  }

  '*'(other: Value) {
    if (other instanceof Number) return new Number(this.value * other.value);
    if (other instanceof Function) return this.operatorFunc(other, '*');
    return this;
  }

  '×'(other: Value) {
    return this['*'](other);
  }

  '/'(other: Value) {
    if (other instanceof Number) return new Number(this.value / other.value);
    if (other instanceof Function) return this.operatorFunc(other, '/');
    return this;
  }

  '%'(other: Value) {
    if (other instanceof Number) return new Number(this.value % other.value);
    if (other instanceof Function) return this.operatorFunc(other, '%');
    return this;
  }

  '^'(other: Value) {
    if (other instanceof Number) return new Number(this.value ** other.value);
    if (other instanceof Function) return this.operatorFunc(other, '^');
    return this;
  }

  '√'() {
    return new Number(Math.sqrt(this.value));
  }

  '∛'() {
    return new Number(Math.cbrt(this.value));
  }

  '∜'() {
    return new Number(Math.sqrt(Math.sqrt(this.value)));
  }

  '!'() {
    return new Number(factorial(this.value));
  }

  '°'() {
    return new Number(this.value * (Math.PI / 180));
  }

  '||'() {
    return new Number(Math.abs(this.value));
  }

  '⌊⌋'() {
    return new Number(Math.floor(this.value));
  }

  '⌈⌉'() {
    return new Number(Math.ceil(this.value));
  }
}

function factorial(x: number): number {
  let ans = 1;
  for (let i = 2; i <= x; i++) {
    ans *= i;
  }
  return ans;
}
