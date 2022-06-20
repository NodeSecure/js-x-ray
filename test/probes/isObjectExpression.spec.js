// Require Internal Dependencies
import { getSastAnalysis, getWarningOnAnalysisResult, parseScript } from "../utils/index.js";
import isObjectExpression from "../../src/probes/isObjectExpression.js";

// Require Third-party dependencies
import test from "tape";

// Require Node.js Dependencies
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("object with 2 properties should have 2 identifiers", (tape) => {
  const str = readFileSync(join(__dirname, "fixtures/objectExpression/object-objectExpression.js"), "utf-8");
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isObjectExpression);

  tape.equal(analysis.idtypes.property, 2);
  tape.equal(analysis.identifiersName[0].name, "log");
  tape.equal(analysis.identifiersName[1].name, "latest");
  tape.end();
});

test("class with 2 properties should have 0 identifier", (tape) => {
  const str = readFileSync(join(__dirname, "fixtures/objectExpression/class-objectExpression.js"), "utf-8");
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isObjectExpression);

  tape.equal(analysis.idtypes.property, 0);
  tape.equal(analysis.identifiersName.length, 0);
  tape.end();
});
