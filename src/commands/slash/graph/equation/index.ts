import Interpreter from "./interpreter";
import Lexer from "./lexer";
import Parser from "./parser";
import Scope from "./scope";
import { Function, Number } from "./values";
import {
  acot,
  acoth,
  acsc,
  acsch,
  asec,
  asech,
  cot,
  coth,
  csc,
  csch,
  sec,
  sech,
} from "@iz7n/std/math";

export default function runner(source: string): (x: number) => number {
  const lexer = new Lexer(source);
  const tokens = lexer.lex();

  const parser = new Parser(tokens);
  const ast = parser.parse();

  const interpreter = new Interpreter();
  const scope = new Scope();

  scope.set("pi", new Number(Math.PI));
  scope.set("e", new Number(Math.E));
  scope.set("phi", new Number((1 + Math.sqrt(5)) / 2));

  scope.set("round", new Function(Math.round));
  scope.set("floor", new Function(Math.floor));
  scope.set("ceil", new Function(Math.ceil));

  scope.set("ln", new Function(Math.log));

  scope.set("sin", new Function(Math.sin));
  scope.set("cos", new Function(Math.cos));
  scope.set("tan", new Function(Math.tan));

  scope.set("asin", new Function(Math.asin));
  scope.set("acos", new Function(Math.acos));
  scope.set("atan", new Function(Math.atan));

  scope.set("sinh", new Function(Math.sinh));
  scope.set("cosh", new Function(Math.cosh));
  scope.set("tanh", new Function(Math.tanh));

  scope.set("asinh", new Function(Math.asinh));
  scope.set("acosh", new Function(Math.acosh));
  scope.set("atanh", new Function(Math.atanh));

  scope.set("sec", new Function(sec));
  scope.set("csc", new Function(csc));
  scope.set("cot", new Function(cot));

  scope.set("asec", new Function(asec));
  scope.set("acsc", new Function(acsc));
  scope.set("acot", new Function(acot));

  scope.set("sech", new Function(sech));
  scope.set("csch", new Function(csch));
  scope.set("coth", new Function(coth));

  scope.set("asech", new Function(asech));
  scope.set("acsch", new Function(acsch));
  scope.set("acoth", new Function(acoth));

  return (x: number) => {
    scope.set("x", new Number(x));
    const value = interpreter.visit(ast, scope);
    if (!(value instanceof Number)) {
      return globalThis.Number.NaN;
    }
    return value.value;
  };
}
