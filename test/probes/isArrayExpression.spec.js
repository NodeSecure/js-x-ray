// Require Internal Dependencies
import isArrayExpression from "../../src/probes/isArrayExpression.js";
import { parseScript, getSastAnalysis } from "../utils/index.js";

// Require Third-party dependencies
import test from "tape";

// Require Node.js Dependencies
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, "fixtures/isArrayExpression");

test("Should detect an array expression", (tape) => {
  const str = readFileSync(join(FIXTURE_PATH, "1-isArrayExpression.js"), "utf-8");
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isArrayExpression);
  tape.equal(analysis.counter.encodedArrayValue, 3);
  tape.end();
});

test("Should not detect an array expression", (tape) => {
  const str = readFileSync(join(FIXTURE_PATH, "2-isArrayExpression.js"), "utf-8");
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isArrayExpression);
  tape.equal(analysis.counter.encodedArrayValue, 0);
  tape.end();
});

