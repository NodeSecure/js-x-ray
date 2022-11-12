// Require Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isObjectExpression from "../../src/probes/isObjectExpression.js";

// Require Third-party dependencies
import test from "tape";

// Require Node.js Dependencies
import { readFileSync } from "fs";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/objectExpression/", import.meta.url);

test("object with 2 properties should have 2 identifiers", (tape) => {
  const str = readFileSync(new URL("object-objectExpression.js", FIXTURE_URL), "utf-8");
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isObjectExpression);

  tape.equal(analysis.idtypes.property, 2);
  tape.equal(analysis.identifiersName[0].name, "log");
  tape.equal(analysis.identifiersName[1].name, "latest");
  tape.end();
});

test("class with 2 properties should have 0 identifier", (tape) => {
  const str = readFileSync(new URL("class-objectExpression.js", FIXTURE_URL), "utf-8");
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isObjectExpression);

  tape.equal(analysis.idtypes.property, 0);
  tape.equal(analysis.identifiersName.length, 0);
  tape.end();
});
