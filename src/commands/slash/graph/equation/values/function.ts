import Value from "./value";

export default class Function extends Value {
  constructor(public execute: (...args: number[]) => number) {
    super();
  }

  toString(): string {
    return `<function>`;
  }
}
