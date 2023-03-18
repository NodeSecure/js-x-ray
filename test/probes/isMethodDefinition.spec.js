// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isMethodDefinition from "../../src/probes/isMethodDefinition.js";

test("should detect two identifiers (constructor and one method definition)", () => {
  const str = `class File {
    constructor() {}
    foo() {}
  }`;
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isMethodDefinition)
    .execute(ast.body);

  assert.deepEqual(analysis.identifiersName, [
    { name: "constructor", type: "method" },
    { name: "foo", type: "method" }
  ]);
});

test("should detect two identifiers (getter and setter)", () => {
  const str = `class File {
    get foo() {}
    set bar(value) {}
  }`;
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isMethodDefinition)
    .execute(ast.body);

  assert.deepEqual(analysis.identifiersName, [
    { name: "foo", type: "method" },
    { name: "bar", type: "method" }
  ]);
});
