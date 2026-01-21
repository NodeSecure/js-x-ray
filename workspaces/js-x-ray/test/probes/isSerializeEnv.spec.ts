// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import isSerializeEnv from "../../src/probes/isSerializeEnv.ts";
import { getSastAnalysis, parseScript } from "../utils/index.ts";

test("should detect JSON.stringify(process.env)", () => {
  const str = "JSON.stringify(process.env)";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning?.kind, "serialize-environment");
  assert.strictEqual(warning?.value, "JSON.stringify(process.env)");
});

test("should detect JSON.stringify(process['env'])", () => {
  const str = "JSON.stringify(process['env'])";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning?.kind, "serialize-environment");
  assert.strictEqual(warning?.value, "JSON.stringify(process.env)");
});

test("should detect JSON.stringify(process[\"env\"])", () => {
  const str = "JSON.stringify(process[\"env\"])";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning?.kind, "serialize-environment");
  assert.strictEqual(warning?.value, "JSON.stringify(process.env)");
});

test("should detect process.env reassignment", () => {
  const str = `
  const env = process.env;
  JSON.stringify(env);
`;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning?.kind, "serialize-environment");
  assert.strictEqual(warning?.value, "JSON.stringify(process.env)");
});

test("should not detect process.env", () => {
  const str = `
  const env = {};
  const env2 = process.env;
  JSON.stringify(env);
`;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
});

test("should be able to detect reassigned JSON.stringify", () => {
  const str = `
  const stringify = JSON.stringify;
  const env = process.env;
  stringify(env);
`;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning?.kind, "serialize-environment");
  assert.strictEqual(warning?.value, "JSON.stringify(process.env)");
});

test("should be able to detect serialization of process.env using a SpreadElement", () => {
  const str = `
  const env = {...process.env};
  JSON.stringify(env);
`;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning?.kind, "serialize-environment");
  assert.strictEqual(warning?.value, "JSON.stringify(process.env)");
});

test("should not detect other JSON.stringify calls", () => {
  const str = "JSON.stringify({ foo: 'bar' })";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
});

test("should not detect direct process.env access in conservative mode (default)", () => {
  const str = "const env = process.env";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
});

test("should detect direct process.env access in aggressive mode", () => {
  const str = "const env = process.env";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv, { sensitivity: "aggressive" }).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("serialize-environment");
  assert.strictEqual(warning?.kind, "serialize-environment");
  assert.strictEqual(warning?.value, "process.env");
});

test("should detect process.env property access in aggressive mode", () => {
  const str = "const home = process.env.HOME";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv, { sensitivity: "aggressive" }).execute(ast.body);

  // Should detect process.env as part of the MemberExpression chain
  assert.strictEqual(sastAnalysis.warnings().length >= 1, true);
});

test("should NOT detect direct process.env access in explicit conservative mode", () => {
  const str = "const env = process.env";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isSerializeEnv, { sensitivity: "conservative" }).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
});

