/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-classes-per-file */
import Value from './value';

export default class Function extends Value {
  constructor(public execute: (...args: number[]) => number) {
    super();
  }

  // eslint-disable-next-line class-methods-use-this
  toString(): string {
    return `<function>`;
  }
}
