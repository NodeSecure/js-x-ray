// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import isRequire from "../../src/probes/isRequire/isRequire.ts";
import { getSastAnalysis, parseScript } from "../utils/index.ts";

test("it should ignore require CallExpression with no (zero) arguments", () => {
  const str = `
    require()
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);

  const dependencies = sastAnalysis.dependencies();
  assert.deepEqual(dependencies.size, 0);
});

test("it should execute probe using require.resolve (detected by the VariableTracer)", () => {
  const str = `
    require.resolve("http");
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.ok(dependencies.has("http"));
});

test("it should execute probe using process.mainModule.require (detected by the VariableTracer)", () => {
  const str = `
    process.mainModule.require("http");
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.ok(dependencies.has("http"));
});

test("it should execute probe using process.getBuiltinModule (detected by the VariableTracer)", () => {
  const str = `
    if (globalThis.process?.getBuiltinModule) {
      const fs = globalThis.process.getBuiltinModule('fs');
      const module = globalThis.process.getBuiltinModule('module');
      const require = module.createRequire(import.meta.url);
      const foo = require('foo');
    }
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.deepEqual(
    [...dependencies.keys()],
    ["fs", "module", "foo"]
  );
});

test("it should execute probe on a variable reassignments of require (detected by the VariableTracer)", () => {
  const str = `
    const r = require;
    const b = r;
    b("http");
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();

  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});

test("it should execute probe on a variable reassignments of require extended (detected by the VariableTracer)", () => {
  const str = `
    const g = global.process;
    const r = g.mainModule;
    const c = r.require;
    c("http");
    r.require("fs");
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();

  assert.strictEqual(dependencies.size, 2);
  assert.ok(dependencies.has("http"));
  assert.ok(dependencies.has("fs"));
});

test("it should catch require with an Identifier argument pointing to the Node.js core http module", () => {
  const str = `
    const foo = "http";
    require(foo);
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});

test("it should throw an 'unsafe-import' warning for a require with an unknown Identifier", () => {
  const str = `
    require(foo);
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");
});

test("it should throw an 'unsafe-import' warning for a require with an unknown MemberExpression", () => {
  const str = `
    require(foo.bar);
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");
});

test("it should catch require with a Literal argument having for value the Node.js core http module", () => {
  const str = `
    require("http");
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});

test(`it should catch require with an ArrayExpression where all Literals values concatened
are equal to the Node.js core http module`, () => {
  const str = `
    require(["h", "t", "t", "p"]);
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});

test(`it should catch require with an ArrayExpression where all Literals values concatened
are equal to the Node.js core http module (with charCodes as values)`, () => {
  const str = `
    // "hello" as char codes
    require([104, 101, 108, 108, 111]);
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("hello"));
});

test(`it should catch require with an ArrayExpression where all Literals values concatened
are equal to the Node.js core http module (with VariableTracer usage)`, () => {
  const str = `
    const a = "h";
    const b = "t";

    require([a, b, b, "p"]);
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});

test(`it should throw an 'unsafe-import' warning for using an ArrayExpression as require argument
where all Literals values concatened is equal to an empty string`, () => {
  const str = `
    require(["", ""]);
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");
});

test(`it should catch require with a BinaryExpression where all level of operands flattened
are equal to the Node.js core http module`, () => {
  const str = `
    require("ht" + "tp");
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});

test(`it should catch require with a BinaryExpression where all level of operands flattened
are equal to the Node.js core http module (with VariableTracer usage)`, () => {
  const str = `
    const left = "ht";
    const right = "tp";

    require(left + right);
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);
  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});

test(`it should throw an 'unsafe-import' warning for using a BinaryExpression
with an operator not equal to '+' as require argument`, () => {
  const str = `
    require(5 - 5);
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");
});

test("it should throw an 'unsafe-import' warning for using a BinaryExpression with one or many unresolvable Operands", () => {
  const str = `
    require("foo" + evil());
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");
});

test("(require CallExpression): it should always throw an 'unsafe-import' warning when using a CallExpression", () => {
  const str = `
    function evil() {
      return "http";
    }
    require(evil());
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");

  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 0);
});

test(`(require CallExpression): it should catch a CallExpression containing an hexadecimal value
and then add the unobfuscated value in the dependency list`, () => {
  const str = `
    function unhex(r) {
      return Buffer.from(r, "hex").toString();
    }
    // http
    require(unhex("68747470"));
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");

  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});

test("(require CallExpression): it should detect MemberExpression Buffer.from", () => {
  const str = `
    require(Buffer.from("68747470", "hex").toString());
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");

  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});

test("(require CallExpression): it should detect MemberExpression Buffer.from (with ArrayExpression argument)", () => {
  const str = `
    require(Buffer.from([104, 101, 108, 108, 111]).toString());
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");

  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("hello"));
});

test("(require CallExpression): it should detect MemberExpression require.resolve with a Literal value", () => {
  const str = `
    require(require.resolve("foo"));
  `;
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(
    sastAnalysis.warnings().length,
    1,
    "must have one unsafe-import warning"
  );
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");

  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("foo"));
});

test("(require CallExpression): it should detect obfuscated atob value", () => {
  const str = `
    const myFunc = atob;
    const dep = require(myFunc('b3' + 'M='));
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-import");
  assert.strictEqual(warning!.kind, "unsafe-import");

  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("os"));
});

test("(require CallExpression): it should not have an unsafe-import for a correct path.resolve", () => {
  const str = `
    const pkg = require(path.resolve('package.json'));
  `;

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRequire)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);

  const dependencies = sastAnalysis.dependencies();
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("package.json"));
});
