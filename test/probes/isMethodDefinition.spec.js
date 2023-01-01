// Require Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isMethodDefinition from "../../src/probes/isMethodDefinition.js";

// Require Third-party dependencies
import test from "tape";

test("should detect two identifiers (constructor and one method definition)", (tape) => {
  const str = `class File {
    constructor() {}
    foo() {}
  }`;
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isMethodDefinition);

  tape.deepEqual(analysis.identifiersName, [
    { name: "constructor", type: "method" },
    { name: "foo", type: "method" }
  ]);

  tape.end();
});

test("should detect two identifiers (getter and setter)", (tape) => {
  const str = `class File {
    get foo() {}
    set bar(value) {}
  }`;
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isMethodDefinition);

  tape.deepEqual(analysis.identifiersName, [
    { name: "foo", type: "method" },
    { name: "bar", type: "method" }
  ]);

  tape.end();
});
