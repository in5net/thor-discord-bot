import { ln } from "../funcs";
import { cos, cot, csc, sec, sin, tan } from "../trigonometry";

export const isin = (x: number, c = 0) => -cos(x) + c;
export const icos = (x: number, c = 0) => sin(x) + c;
export const itan = (x: number, c = 0) => -ln(Math.abs(cos(x))) + c;

export const isec = (x: number, c = 0) => ln(Math.abs(sec(x) + tan(x))) + c;
export const icsc = (x: number, c = 0) => -ln(Math.abs(csc(x) + cot(x))) + c;
export const icot = (x: number, c = 0) => ln(Math.abs(sin(x))) + c;
