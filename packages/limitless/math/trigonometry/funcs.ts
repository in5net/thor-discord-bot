export const {
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
  sinh,
  cosh,
  tanh,
  asinh,
  acosh,
  atanh
} = Math;

export const sec = (x: number): number => 1 / cos(x);
export const csc = (x: number): number => 1 / sin(x);
export const cot = (x: number): number => 1 / tan(x);

export const asec = (x: number): number => 1 / acos(x);
export const acsc = (x: number): number => 1 / asin(x);
export const acot = (x: number): number => 1 / atan(x);

export const sech = (x: number): number => 1 / cosh(x);
export const csch = (x: number): number => 1 / sinh(x);
export const coth = (x: number): number => 1 / tanh(x);

export const asech = (x: number): number => 1 / acosh(x);
export const acsch = (x: number): number => 1 / asinh(x);
export const acoth = (x: number): number => 1 / atanh(x);
