import Lexer from "./lexer";
import Parser from "./parser";

const input = "-p hello world 7";
const lexer = new Lexer(input);
console.log("lexing...");
const tokens = lexer.lex();
console.log("tokens:", tokens);

const parser = new Parser(tokens);
console.log("parsing...");
const ast = parser.parse();
console.log("ast:", JSON.stringify(ast, null, 2));
