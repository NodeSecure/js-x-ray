// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { parseScript, getSastAnalysis } from "../utils/index.js";
import isUnsafeSpawn from "../../src/probes/isUnsafeSpawn.js";

// CONSTANTS
const kWarningUnsafeSpawn = "unsafe-spawn";

test("should detect csrutil spawn command", () => {
  const str = `
    const { spawn } = require("child_process");
    spawn("csrutil", ["status"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeSpawn)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeSpawn);
  assert.equal(result.kind, kWarningUnsafeSpawn);
  assert.equal(result.value, "csrutil");
});

// TODO: de-skip when the tracer would be ready
test.skip("should detect hidden csrutil spawn command", () => {
  const str = `
    const { spawn: hide } = require("child_process");
    hide("csrutil", ["status"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeSpawn)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeSpawn);
  assert.equal(result.kind, kWarningUnsafeSpawn);
  assert.equal(result.value, "csrutil");
});

test("should detect csrutil spawn command with require", () => {
  const str = `
    require("child_process").spawn("csrutil", ["disable"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeSpawn)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeSpawn);
  assert.equal(result.kind, kWarningUnsafeSpawn);
  assert.equal(result.value, "csrutil");
});

test("should not detect non-csrutil spawn command", () => {
  const str = `
    const { spawn } = require("child_process");
    spawn("ls", ["-la"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeSpawn)
    .execute(ast.body);

  assert.equal(sastAnalysis.warnings().length, 0);
});
