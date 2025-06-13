// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isLiteralRegex from "../../src/probes/isLiteralRegex.js";

test("should throw a 'unsafe-regex' warning because the given RegExp Literal is unsafe", () => {
  const str = "const foo = /(a+){10}/g;";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteralRegex)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const result = sastAnalysis.getWarning("unsafe-regex");
  assert.strictEqual(result.value, "(a+){10}");
});
