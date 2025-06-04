// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isLiteral from "../../src/probes/isLiteral.js";

test("should throw an unsafe-import because the hexadecimal string is equal to the core 'http' dependency", (t) => {
  const str = "const foo = '68747470'";
  const ast = parseScript(str);

  const sastAnalysis = getSastAnalysis(str, isLiteral);
  t.mock.method(sastAnalysis.sourceFile.deobfuscator, "analyzeString");
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning.kind, "unsafe-import");

  assert.ok(sastAnalysis.dependencies().has("http"));
  const calls = sastAnalysis.sourceFile.deobfuscator.analyzeString.mock.calls;
  assert.strictEqual(calls.length, 1);
  assert.ok(calls[0].arguments.includes("http"));
});

test("should throw an encoded-literal warning because the hexadecimal value is equal to 'require'", (t) => {
  const str = "const _t = globalThis['72657175697265']";
  const ast = parseScript(str);

  const sastAnalysis = getSastAnalysis(str, isLiteral);
  t.mock.method(sastAnalysis.sourceFile.deobfuscator, "analyzeString");
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("encoded-literal");
  assert.strictEqual(warning.value, "72657175697265");

  const calls = sastAnalysis.sourceFile.deobfuscator.analyzeString.mock.calls;
  assert.strictEqual(calls.length, 1);
  assert.ok(calls[0].arguments.includes("require"));
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

test("should not throw any warnings without hexadecimal value (and should call analyzeLiteral of Analysis class)", (t) => {
  const str = "const foo = 'hello world!'";
  const ast = parseScript(str);

  const sastAnalysis = getSastAnalysis(str, isLiteral);
  t.mock.method(sastAnalysis.sourceFile, "analyzeLiteral");
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const calls = sastAnalysis.sourceFile.analyzeLiteral.mock.calls;
  assert.strictEqual(calls.length, 1);

  const astNode = calls[0].arguments[0];
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

test("should detect shady link when an URL is ipinfo.io when protocol is http", () => {
  const str = "const foo = 'http://ipinfo.io/json'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);
  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "http://ipinfo.io/json");
});

test("should detect shady link when an URL is ipinfo.io when protocol is https", () => {
  const str = "const foo = 'https://ipinfo.io/json'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);
  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "https://ipinfo.io/json");
});

test("should detect shady link when an URL is httpbin.org when protocol is http", () => {
  const str = "const foo = 'http://httpbin.org/ip'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);
  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "http://httpbin.org/ip");
});

test("should detect shady link when an URL is httpbin.org when protocol is https", () => {
  const str = "const foo = 'https://httpbin.org/ip'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);
  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "https://httpbin.org/ip");
});

test("should detect shady link when an URL has a suspicious domain", () => {
  const str = "const foo = 'http://foobar.link'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "http://foobar.link");
});

test("should not mark suspicious links the IPv4 address range 127.0.0.0/8 (localhost 127.0.0.1)", () => {
  const str = "const IPv4URL = ['http://127.0.0.1/script', 'http://127.7.7.7/script']";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  assert.ok(!sastAnalysis.warnings().length);
});

test("should not be considered suspicious a link with a raw IPv4 address 127.0.0.1 and a port", () => {
  const str = "const IPv4URL = 'http://127.0.0.1:80/script'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  assert.ok(!sastAnalysis.warnings().length);
});

test("should detect the link as suspicious when a URL contains a raw IPv4 address", () => {
  const str = "const IPv4URL = 'http://77.244.210.247/burpcollaborator.txt'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "http://77.244.210.247/burpcollaborator.txt");
});

test("should detect suspicious links when a URL contains a raw IPv4 address with port", () => {
  const str = "const IPv4URL = 'http://77.244.210.247:8080/script'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "http://77.244.210.247:8080/script");
});

test("should detect suspicious links when a URL contains a raw IPv6 address", () => {
  const str = "const IPv6URL = 'http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]/index.html'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]/index.html");
});

test("should detect suspicious links when a URL contains a raw IPv6 address with port", () => {
  const str = "const IPv6URL = 'http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:100/script'";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isLiteral).execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("shady-link");
  assert.strictEqual(warning.value, "http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:100/script");
});
