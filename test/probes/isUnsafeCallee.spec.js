// Require Internal Dependencies
import { parseScript, getSastAnalysis, getWarningOnAnalysisResult } from "../utils/index.js";
import { warnings } from "../../index.js";
import isUnsafeCallee from "../../src/probes/isUnsafeCallee.js";

// Require Third-party dependencies
import test from "tape";

// Require Node.js Dependencies
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, "fixtures/unsafeCallee");

const warningUnsafeStmt = warnings.unsafeStmt.code;

test("should detect eval", (tape) => {
  const str = readFileSync(join(FIXTURE_PATH, "1-unsafeCallee.js"), "utf-8");

  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isUnsafeCallee);

  const result = getWarningOnAnalysisResult(analysis, warningUnsafeStmt);
  tape.equal(result.kind, warningUnsafeStmt);
  tape.equal(result.value, "eval");
  tape.end();
});

test("should detect Function", (tape) => {
  const str = readFileSync(join(FIXTURE_PATH, "2-unsafeCallee.js"), "utf-8");

  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isUnsafeCallee);

  const result = getWarningOnAnalysisResult(analysis, warningUnsafeStmt);
  tape.equal(result.kind, warningUnsafeStmt);
  tape.equal(result.value, "Function");
  tape.end();
});

test("should not detect Function", (tape) => {
  const str = readFileSync(join(FIXTURE_PATH, "3-unsafeCallee.js"), "utf-8");

  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isUnsafeCallee);

  const result = getWarningOnAnalysisResult(analysis, warningUnsafeStmt);
  tape.equal(result, undefined);
  tape.end();
});
