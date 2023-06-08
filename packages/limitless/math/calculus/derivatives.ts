import { ln } from "../funcs";
import { cot, csc, sec, sin, tan } from "../trigonometry";

export const dcos = (x: number): number => -sin(x);
export const dtan = (x: number): number => sec(x) ** 2;

export const dsec = (x: number): number => sec(x) * tan(x);
export const dcsc = (x: number): number => -csc(x) * cot(x);
export const dcot = (x: number): number => -(csc(x) ** 2);

export const dln = (x: number): number => 1 / x;
export const dlog = (base: number, x: number): number => 1 / (x * ln(base));

export { cos as dsin } from "../trigonometry";
