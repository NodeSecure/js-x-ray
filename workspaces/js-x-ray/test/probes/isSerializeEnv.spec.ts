// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isSerializeEnv from "../../src/probes/isSerializeEnv.js";

test("should detect JSON.stringify(process.env)", () => {
  const str = "JSON.stringify(process.env)";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning.kind, "serialize-environment");
  assert.strictEqual(warning.value, "JSON.stringify(process.env)");
});

test("should detect JSON.stringify(process['env'])", () => {
  const str = "JSON.stringify(process['env'])";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning.kind, "serialize-environment");
  assert.strictEqual(warning.value, "JSON.stringify(process.env)");
});

test("should detect JSON.stringify(process[\"env\"])", () => {
  const str = "JSON.stringify(process[\"env\"])";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning.kind, "serialize-environment");
  assert.strictEqual(warning.value, "JSON.stringify(process.env)");
});

test("should detect process.env reassignment", () => {
  const str = `
  const env = process.env;
  JSON.stringify(env);
`;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning.kind, "serialize-environment");
  assert.strictEqual(warning.value, "JSON.stringify(process.env)");
});

test("should not falsly detect process.env", () => {
  const str = `
  const env = {};
  const env2 = process.env;
  JSON.stringify(env);
`;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
});

test("should be able to detect reassigned JSON.stringify", () => {
  const str = `
  const stringify = JSON.stringify;
  const env = process.env;
  stringify(env);
`;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning.kind, "serialize-environment");
  assert.strictEqual(warning.value, "JSON.stringify(process.env)");
});

test("should not detect other JSON.stringify calls", () => {
  const str = "JSON.stringify({ foo: 'bar' })";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
});

test("should not detect non-JSON.stringify calls", () => {
  const str = "const env = process.env";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
});
