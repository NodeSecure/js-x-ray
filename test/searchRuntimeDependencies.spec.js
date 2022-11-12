// Import Node.js Dependencies
import { readFileSync } from "fs";

// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { runASTAnalysis } from "../index.js";
import { getWarningKind } from "./utils/index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

test("should return all the required runtime dependencies", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
    const http = require("http");
    const net = require("net");
    const fs = require("fs").promises;

    require("assert").strictEqual;
    require("timers");
    require("./aFile.js");

    const myVar = "path";
    require(myVar);`, { module: false });

  tape.strictEqual(warnings.length, 0);
  tape.deepEqual([...dependencies],
    ["http", "net", "fs", "assert", "timers", "./aFile.js", "path"]
  );
  tape.end();
});

test("should return the dependencies even when they are concatened by a BinaryExpression", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
    const myVar = "ht";
    require(myVar + "tp");
    require("eve" + "nt" + "s");
  `);

  tape.strictEqual(warnings.length, 0);
  tape.deepEqual([...dependencies], ["http", "events"]);
  tape.end();
});

test("should return unsafe-import when a CallExpression is used in a require statment", (tape) => {
  const { dependencies, warnings, isOneLineRequire } = runASTAnalysis(`
    function evil() {
        return "http";
    }
    require(evil());
    require(evil() + "s");
  `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-import", "unsafe-import"].sort());
  tape.strictEqual(isOneLineRequire, false);
  tape.deepEqual([...dependencies], []);
  tape.end();
});

test("should return the string value of the encoded hexadecimal literal", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
        const boo = "796f6f6f6c6f";
        const foo = "68747470";
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-import", "encoded-literal"].sort());
  tape.deepEqual([...dependencies], ["http"]);
  tape.end();
});

test("should detect an unsafe import because of the usage of data:text/javascript", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
        import 'data:text/javascript;base64,Y29uc29sZS5sb2coJ2hlbGxvIHdvcmxkJyk7Cg==';
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-import"].sort());
  tape.deepEqual([...dependencies], ["data:text/javascript;base64,Y29uc29sZS5sb2coJ2hlbGxvIHdvcmxkJyk7Cg=="]);
  tape.end();
});

test("should be capable to reverse the CallExpression Buffer.from call with an ArrayExpression as first argument", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
        const px = require.resolve(
            Buffer.from([100, 108, 45, 116, 97, 114]).toString()
        );
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-import"].sort());
  tape.deepEqual([...dependencies], ["dl-tar"]);
  tape.end();
});

test("should reverse the encoded hexadecimal value even if we can't follow unhex CallExpression", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
        function unhex(r) {
            return r;
        }
        const px = require.resolve(unhex("646c2d746172"));
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-import"].sort());
  tape.deepEqual([...dependencies], ["dl-tar"]);
  tape.end();
});

test("should be capable to reverse the CallExpression Buffer.from with an hexadecimal value as first argument", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
        const px = require.resolve(
            Buffer.from("646c2d746172", "hex").toString()
        );
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-import"].sort());
  tape.deepEqual([...dependencies], ["dl-tar"]);
  tape.end();
});

test("should return an unsafe-assign warning when a protected global is assigned to a variable", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
        const r = require.resolve;
        r("http");
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-assign"].sort());
  tape.deepEqual([...dependencies], ["http"]);
  tape.end();
});

test("should succesfully follow the require stmt when assigned multiple times and then used to require a dependency", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
        const r = require;
        const b = r;
        b("http");
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-assign", "unsafe-assign"].sort());
  tape.deepEqual([...dependencies], ["http"]);
  tape.end();
});

test("should return unsafe-import when trying to require an empty ArrayExpression (or empty Literal)", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
        require(["", ""]);
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-import"].sort());
  tape.deepEqual([...dependencies], []);
  tape.end();
});

test("should detect unsafe eval statments", (tape) => {
  const { warnings } = runASTAnalysis(`
        eval("this");
        const g = eval("this");
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-stmt", "unsafe-stmt"].sort());
  tape.end();
});

test("should detect unsafe Function statments", (tape) => {
  const { warnings } = runASTAnalysis(`
    Function("return this")();
    const g = Function("return this")();
  `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-stmt", "unsafe-stmt"].sort());
  tape.end();
});

test("should detect unsafe-assign of eval", (tape) => {
  const { warnings } = runASTAnalysis(`
        const e = eval;
    `);

  tape.deepEqual(getWarningKind(warnings), ["unsafe-assign"].sort());
  tape.end();
});

test("should be capable of following global parts", (tape) => {
  const { warnings, dependencies } = runASTAnalysis(`
        const g = global.process;
        const r = g.mainModule;
        const c = r.require;
        c("http");
        r.require("fs");
    `);

  tape.deepEqual(getWarningKind(warnings), [
    "unsafe-assign", "unsafe-assign", "unsafe-assign"
  ].sort());
  tape.deepEqual([...dependencies], ["http", "fs"]);
  tape.end();
});

test("should return runtime dependencies concatened when done in a ArrayExpression", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
        const foo = "bar";

        require.resolve("http");
        require(["net", "-", "tcp"]);
        require([foo, "world"]);
        require([104,101,108,108,111]);

        process.mainModule.require("util");
    `);

  tape.strictEqual(warnings.length, 0);
  tape.deepEqual([...dependencies], ["http", "net-tcp", "barworld", "hello", "util"]);
  tape.end();
});

test("should detect the suspicious string", (tape) => {
  const suspectString = readFileSync(new URL("suspect-string.js", FIXTURE_URL), "utf-8");
  const { warnings, stringScore } = runASTAnalysis(suspectString);

  tape.deepEqual(getWarningKind(warnings), ["suspicious-literal"].sort());
  tape.strictEqual(stringScore, 8);
  tape.end();
});

test("should be capable to follow hexa computation members expr", (tape) => {
  const advancedComputation = readFileSync(new URL("advanced-computation.js", FIXTURE_URL), "utf-8");
  const { warnings, dependencies } = runASTAnalysis(advancedComputation);

  tape.deepEqual(getWarningKind(warnings), [
    "encoded-literal",
    "unsafe-assign",
    "unsafe-assign",
    "unsafe-import",
    "unsafe-stmt"
  ].sort());
  tape.deepEqual([...dependencies], ["./test/data"]);
  tape.end();
});

test("should support runtime analysis of ESM and return http", (tape) => {
  const esm = readFileSync(new URL("esm.js", FIXTURE_URL), "utf-8");
  const { dependencies, warnings } = runASTAnalysis(esm, { module: true });

  tape.strictEqual(warnings.length, 0);
  tape.deepEqual([...dependencies], ["http"]);
  tape.end();
});

test("should detect two unsafe regex", (tape) => {
  const regexUnsafe = readFileSync(new URL("unsafe-regex.js", FIXTURE_URL), "utf-8");
  const { warnings } = runASTAnalysis(regexUnsafe, { module: false });
  tape.deepEqual(getWarningKind(warnings), ["unsafe-regex", "unsafe-regex"].sort());
  tape.end();
});

test("should detect short identifiers!", (tape) => {
  const shortIds = readFileSync(new URL("short-ids.js", FIXTURE_URL), "utf-8");
  const { warnings } = runASTAnalysis(shortIds);

  tape.deepEqual(getWarningKind(warnings), ["short-identifiers"].sort());
  tape.end();
});

test("should detect that http is under a TryStatement", (tape) => {
  const trycatch = readFileSync(new URL("try-catch.js", FIXTURE_URL), "utf-8");
  const { dependencies: deps } = runASTAnalysis(trycatch);

  tape.strictEqual(Reflect.has(deps.dependencies, "http"), true);
  tape.strictEqual(deps.dependencies.http.inTry, true);
  tape.end();
});

test("should return isOneLineRequire true for a one liner CJS export", (tape) => {
  const { dependencies, isOneLineRequire } = runASTAnalysis("module.exports = require('foo');");

  tape.strictEqual(isOneLineRequire, true);
  tape.deepEqual([...dependencies], ["foo"]);
  tape.end();
});

test("should be capable to follow require assign", (tape) => {
  const { dependencies } = runASTAnalysis(`
        const b = require;
        b("fs");
    `);

  tape.deepEqual([...dependencies], ["fs"]);
  tape.end();
});

