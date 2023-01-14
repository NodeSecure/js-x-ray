// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isFunctionDeclaration from "../../src/probes/isFunction.js";

test("should detect one FunctionDeclaration node", (tape) => {
  const str = "function foo() {}";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isFunctionDeclaration)
    .execute(ast.body);

  tape.equal(analysis.idtypes.functionDeclaration, 1);

  tape.end();
});

test("should detect zero FunctionDeclaration (because foo is a CallExpression Node)", (tape) => {
  const str = "foo()";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isFunctionDeclaration)
    .execute(ast.body);

  tape.equal(analysis.idtypes.functionDeclaration, 0);

  tape.end();
});

test("should detect zero FunctionDeclaration for an IIFE (because there is no Identifier)", (tape) => {
  const str = "(function() {})()";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isFunctionDeclaration)
    .execute(ast.body);

  tape.equal(analysis.idtypes.functionDeclaration, 0);

  tape.end();
});

test("should detect three identifiers (one function declaration and two params identifier)", (tape) => {
  const str = "function foo(err, result) {}";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isFunctionDeclaration)
    .execute(ast.body);

  tape.deepEqual(analysis.identifiersName, [
    { name: "err", type: "params" },
    { name: "result", type: "params" },
    { name: "foo", type: "functionDeclaration" }
  ]);

  tape.end();
});
