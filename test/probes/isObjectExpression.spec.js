// Import Node.js Dependencies
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isObjectExpression from "../../src/probes/isObjectExpression.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/objectExpression/", import.meta.url);

test("object with 2 properties should have 2 identifiers", () => {
  const str = readFileSync(new URL("object-objectExpression.js", FIXTURE_URL), "utf-8");
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isObjectExpression)
    .execute(ast.body);

  assert.equal(sourceFile.idtypes.property, 2);
  assert.equal(sourceFile.identifiersName[0].name, "log");
  assert.equal(sourceFile.identifiersName[1].name, "latest");
});

test("class with 2 properties should have 0 identifier", () => {
  const str = readFileSync(new URL("class-objectExpression.js", FIXTURE_URL), "utf-8");
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isObjectExpression)
    .execute(ast.body);

  assert.equal(sourceFile.idtypes.property, 0);
  assert.equal(sourceFile.identifiersName.length, 0);
});
