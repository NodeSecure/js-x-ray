// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isVariableDeclaration from "../../src/probes/isVariableDeclaration.js";

test("should detect and save all VariableDeclaration kinds", () => {
  const str = "var foo; const a = 5; let b = 'foo';";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isVariableDeclaration)
    .execute(ast.body);

  assert.deepEqual(analysis.varkinds, {
    const: 1,
    let: 1,
    var: 1
  });
});

test("should count the number of VariableDeclarator node", () => {
  const str = "let a,b,c;";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isVariableDeclaration)
    .execute(ast.body);

  assert.strictEqual(analysis.idtypes.variableDeclarator, 3);
});

test("should detect and save VariableDeclarator Identifier", () => {
  const str = "let foobar = 5;";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isVariableDeclaration)
    .execute(ast.body);

  assert.deepEqual(analysis.identifiersName, [
    {
      name: "foobar",
      type: "variableDeclarator"
    }
  ]);
});
