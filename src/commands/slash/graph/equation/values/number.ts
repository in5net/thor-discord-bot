import { type BinaryOp } from "../token";
import Function from "./function";
import Value from "./value";

export default class Number extends Value {
  "constructor"(public value: number) {
    super();
  }

  "toString"(): string {
    return this.value.toString();
  }

  "operatorFunc"(func: Function, op: BinaryOp): Function {
    return new Function(x => {
      const value = this[op](new Number(func.execute(x)));
      return value instanceof Number ? value.value : globalThis.Number.NaN;
    });
  }

  override "+"(other?: Value) {
    if (other instanceof Number) {
      return new Number(this.value + other.value);
    }
    if (other instanceof Function) {
      return this.operatorFunc(other, "+");
    }
    return this;
  }

  override "-"(other?: Value) {
    if (other instanceof Number) {
      return new Number(this.value - other.value);
    }
    if (other instanceof Function) {
      return this.operatorFunc(other, "-");
    }
    return new Number(-this.value);
  }

  override "*"(other: Value) {
    if (other instanceof Number) {
      return new Number(this.value * other.value);
    }
    if (other instanceof Function) {
      return this.operatorFunc(other, "*");
    }
    return this;
  }

  override "×"(other: Value) {
    return this["*"](other);
  }

  override "/"(other: Value) {
    if (other instanceof Number) {
      return new Number(this.value / other.value);
    }
    if (other instanceof Function) {
      return this.operatorFunc(other, "/");
    }
    return this;
  }

  override "%"(other: Value) {
    if (other instanceof Number) {
      return new Number(this.value % other.value);
    }
    if (other instanceof Function) {
      return this.operatorFunc(other, "%");
    }
    return this;
  }

  override "^"(other: Value) {
    if (other instanceof Number) {
      return new Number(this.value ** other.value);
    }
    if (other instanceof Function) {
      return this.operatorFunc(other, "^");
    }
    return this;
  }

  override "√"() {
    return new Number(Math.sqrt(this.value));
  }

  override "∛"() {
    return new Number(Math.cbrt(this.value));
  }

  override "∜"() {
    return new Number(Math.sqrt(Math.sqrt(this.value)));
  }

  override "!"() {
    return new Number(factorial(this.value));
  }

  override "°"() {
    return new Number(this.value * (Math.PI / 180));
  }

  override "||"() {
    return new Number(Math.abs(this.value));
  }

  override "⌊⌋"() {
    return new Number(Math.floor(this.value));
  }

  override "⌈⌉"() {
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
