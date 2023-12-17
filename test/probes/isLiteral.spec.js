// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript, mockedFunction } from "../utils/index.js";
import isLiteral from "../../src/probes/isLiteral.js";

test("should throw an unsafe-import because the hexadecimal string is equal to the core 'http' dependency", () => {
  const str = "const foo = '68747470'";
  const ast = parseScript(str);

  const analyzeStringMock = mockedFunction();
  const sastAnalysis = getSastAnalysis(str, isLiteral);
  sastAnalysis.analysis.analyzeString = analyzeStringMock.callback.bind(analyzeStringMock);
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning.kind, "unsafe-import");

  assert.ok(sastAnalysis.dependencies().has("http"));
  assert.ok(analyzeStringMock.haveBeenCalledTimes(1));
  assert.ok(analyzeStringMock.haveBeenCalledWith("http"));
});

test("should throw an encoded-literal warning because the hexadecimal value is equal to 'require'", () => {
  const str = "const _t = globalThis['72657175697265']";
  const ast = parseScript(str);

  const analyzeStringMock = mockedFunction();
  const sastAnalysis = getSastAnalysis(str, isLiteral);
  sastAnalysis.analysis.analyzeString = analyzeStringMock.callback.bind(analyzeStringMock);
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("encoded-literal");
  assert.strictEqual(warning.value, "72657175697265");

  assert.ok(analyzeStringMock.haveBeenCalledTimes(1));
  assert.ok(analyzeStringMock.haveBeenCalledWith("require"));
});

test("should not throw an encoded-literal warning because hexadecimal value is safe", () => {
  const str = "const foo = '123456789'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
});

test("should throw an encoded-literal warning because hexadecimal value is not safe", () => {
  // Note: hexadecimal equal 'hello world'
  const str = "const foo = '68656c6c6f20776f726c64'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("encoded-literal");
  assert.strictEqual(warning.value, "68656c6c6f20776f726c64");
});

test("should not throw any warnings without hexadecimal value (and should call analyzeLiteral of Analysis class)", () => {
  const str = "const foo = 'hello world!'";
  const ast = parseScript(str);

  const analyzeLiteralMock = mockedFunction();
  const sastAnalysis = getSastAnalysis(str, isLiteral);
  sastAnalysis.analysis.analyzeLiteral = analyzeLiteralMock.callback.bind(analyzeLiteralMock);
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  assert.ok(analyzeLiteralMock.haveBeenCalledTimes(1));

  const astNode = analyzeLiteralMock.args[0];
  assert.strictEqual(astNode.value, "hello world!");
});

test("should detect shady link when an URL is bit.ly", () => {
  const str = "const foo = 'http://bit.ly/foo'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "http://bit.ly/foo");
});


test("should detect shady link when an URL has a suspicious domain", () => {
  const str = "const foo = 'http://foobar.link'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "http://foobar.link");
});
