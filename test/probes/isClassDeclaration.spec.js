// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isClassDeclaration from "../../src/probes/isClassDeclaration.js";

test("should detect two identifiers (class name and superClass name A.K.A extends)", () => {
  const str = "class File extends Blob {}";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isClassDeclaration)
    .execute(ast.body);

  assert.deepEqual(sourceFile.identifiersName, [
    { name: "File", type: "class" },
    { name: "Blob", type: "class" }
  ]);
});

test("should detect one identifier because there is no superClass (extension)", () => {
  const str = "class File {}";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isClassDeclaration)
    .execute(ast.body);

  assert.deepEqual(sourceFile.identifiersName, [
    { name: "File", type: "class" }
  ]);
});

test("should detect one identifier because superClass is not an Identifier but a CallExpression", () => {
  const str = "class File extends (foo()) {}";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isClassDeclaration)
    .execute(ast.body);

  assert.deepEqual(sourceFile.identifiersName, [
    { name: "File", type: "class" }
  ]);
});
