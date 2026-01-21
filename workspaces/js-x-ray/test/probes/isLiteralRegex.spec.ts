// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import isLiteralRegex from "../../src/probes/isLiteralRegex.ts";
import { getSastAnalysis, parseScript } from "../utils/index.ts";

test("should throw a 'unsafe-regex' warning because the given RegExp Literal is unsafe", () => {
  const str = "const foo = /(a+){10}/g;";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isLiteralRegex)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const result = sastAnalysis.getWarning("unsafe-regex");
  assert.ok(result);
  assert.strictEqual(result.value, "(a+){10}");
});
