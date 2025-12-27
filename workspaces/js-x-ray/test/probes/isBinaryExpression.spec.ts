// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import isBinaryExpression from "../../src/probes/isBinaryExpression.ts";
import { getSastAnalysis, parseScript } from "../utils/index.ts";

test("should detect 1 deep binary expression", () => {
  const str = "0x1*-0x12df+-0x1fb9*-0x1+0x2*-0x66d";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(isBinaryExpression)
    .execute(ast.body);

  assert.equal(sourceFile.deobfuscator.deepBinaryExpression, 1);
});

test("should not detect deep binary expression", () => {
  const str = "10 + 5 - (10)";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(isBinaryExpression)
    .execute(ast.body);

  assert.equal(sourceFile.deobfuscator.deepBinaryExpression, 0);
});
