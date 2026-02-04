
// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

test("it should report a warning for Math.random() usage when enabled", () => {
  const code = `
    const token = Math.random();
  `;
  const { warnings: outputWarnings } = new AstAnalyser({
    optionalWarnings: ["insecure-random"]
  }).analyse(code);

  assert.strictEqual(outputWarnings.length, 1);
  assert.strictEqual(outputWarnings[0].kind, "insecure-random");
  assert.strictEqual(outputWarnings[0].value, null);
});

test("it should NOT report a warning for Math.random() if NOT enabled", () => {
  const code = `
    const token = Math.random();
  `;
  const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

  assert.strictEqual(outputWarnings.length, 0);
});

test("it should report a warning for Math.random() usage when reassigned", () => {
  const code = `
    const m = Math;
    const token = m.random();
  `;
  const { warnings: outputWarnings } = new AstAnalyser({
    optionalWarnings: ["insecure-random"]
  }).analyse(code);

  assert.strictEqual(outputWarnings.length, 1);
  assert.strictEqual(outputWarnings[0].kind, "insecure-random");
});
