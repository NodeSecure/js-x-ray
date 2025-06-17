// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { parseScript, getSastAnalysis } from "../utils/index.js";
import isUnsafeCommand from "../../src/probes/isUnsafeCommand.js";

// CONSTANTS
const kWarningUnsafeCommand = "unsafe-command";

// Spawn

test("should detect csrutil spawn command", () => {
  const str = `
    const { spawn } = require("child_process");
    spawn("csrutil", ["status"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
  assert.equal(result.kind, kWarningUnsafeCommand);
  assert.equal(result.value, "csrutil status");
});

// TODO: de-skip when the tracer would be ready
test.skip("should detect hidden csrutil spawn command", () => {
  const str = `
    const { spawn: hide } = require("child_process");
    hide("csrutil", ["status"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
  assert.equal(result.kind, kWarningUnsafeCommand);
  assert.equal(result.value, "csrutil status");
});

test("should detect csrutil spawn command with require", () => {
  const str = `
    require("child_process").spawn("csrutil", ["disable"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
  assert.equal(result.kind, kWarningUnsafeCommand);
  assert.equal(result.value, "csrutil disable");
});

test("should not detect non suspicious spawned command", () => {
  const str = `
    const { spawn } = require("child_process");
    spawn("ls", ["-la"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
    .execute(ast.body);

  assert.equal(sastAnalysis.warnings().length, 0);
});

// Exec

test("should detect csrutil exec command", () => {
  const str = `
    const { exec } = require("child_process");
    exec("csrutil status");
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
  assert.equal(result.kind, kWarningUnsafeCommand);
  assert.equal(result.value, "csrutil status");
});

// TODO: de-skip when the tracer would be ready
test.skip("should detect hidden csrutil spawn command", () => {
  const str = `
    const { exec: hide } = require("child_process");
    exec("csrutil status");
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
  assert.equal(result.kind, kWarningUnsafeCommand);
  assert.equal(result.value, "csrutil status");
});

test("should detect csrutil spawn command with require", () => {
  const str = `
    require("child_process").exec("csrutil disable");
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
  assert.equal(result.kind, kWarningUnsafeCommand);
  assert.equal(result.value, "csrutil disable");
});

test("should not detect non suspicious exec-ed command", () => {
  const str = `
    const { exec } = require("child_process");
    exec("ls -la");
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
    .execute(ast.body);

  assert.equal(sastAnalysis.warnings().length, 0);
});
