// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isFunctionDeclaration from "../../src/probes/isFunction.js";

test("should detect one FunctionDeclaration node", () => {
  const str = "function foo() {}";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isFunctionDeclaration)
    .execute(ast.body);

  assert.equal(sourceFile.idtypes.functionDeclaration, 1);
});

test("should detect zero FunctionDeclaration (because foo is a CallExpression Node)", () => {
  const str = "foo()";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isFunctionDeclaration)
    .execute(ast.body);

  assert.equal(sourceFile.idtypes.functionDeclaration, 0);
});

test("should detect zero FunctionDeclaration for an IIFE (because there is no Identifier)", () => {
  const str = "(function() {})()";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isFunctionDeclaration)
    .execute(ast.body);

  assert.equal(sourceFile.idtypes.functionDeclaration, 0);
});

test("should detect three identifiers (one function declaration and two params identifier)", () => {
  const str = "function foo(err, result) {}";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isFunctionDeclaration)
    .execute(ast.body);

  assert.deepEqual(sourceFile.identifiersName, [
    { name: "err", type: "params" },
    { name: "result", type: "params" },
    { name: "foo", type: "functionDeclaration" }
  ]);
});
