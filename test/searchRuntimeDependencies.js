"use strict";

// Require Node.js Dependencies
const { readFileSync } = require("fs");
const { join } = require("path");

// Require Internal Dependencies
const { runASTAnalysis, CONSTANTS: { Warnings } } = require("..");
const { getWarningKind } = require("./utils");

// CONSTANTS
const FIXTURE_PATH = join(__dirname, "fixtures/searchRuntimeDependencies");

test("should return all the required runtime dependencies", () => {
    const { dependencies, warnings } = runASTAnalysis(`
    const http = require("http");
    const net = require("net");
    const fs = require("fs").promises;

    require("assert").strictEqual;
    require("timers");
    require("./aFile.js");

    const myVar = "path";
    require(myVar);`, { module: false });

    expect(warnings.length).toStrictEqual(0);
    expect([...dependencies]).toStrictEqual(
        ["http", "net", "fs", "assert", "timers", "./aFile.js", "path"]
    );
});

test("should return the dependencies even when they are concatened by a BinaryExpression", () => {
    const { dependencies, warnings } = runASTAnalysis(`const myVar = "ht";
        require(myVar + "tp");
        require("eve" + "nt" + "s");
    `);

    expect(warnings.length).toStrictEqual(0);
    expect([...dependencies]).toStrictEqual(["http", "events"]);
});

test("should return unsafe-import when a CallExpression is used in a require statment", () => {
    const { dependencies, warnings, isOneLineRequire } = runASTAnalysis(`
        function evil() {
            return "http";
        }
        require(evil());
        require(evil() + "s");
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeImport, Warnings.unsafeImport].sort());
    expect(isOneLineRequire).toStrictEqual(false);
    expect([...dependencies]).toStrictEqual([]);
});

test("should return the string value of the encoded hexadecimal literal", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const boo = "796f6f6f6c6f";
        const foo = "68747470";
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeImport, Warnings.encodedLiteral].sort());
    expect([...dependencies]).toStrictEqual(["http"]);
});

test("should be capable to reverse the CallExpression Buffer.from call with an ArrayExpression as first argument", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const px = require.resolve(
            Buffer.from([100, 108, 45, 116, 97, 114]).toString()
        );
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeImport].sort());
    expect([...dependencies]).toStrictEqual(["dl-tar"]);
});

test("should reverse the encoded hexadecimal value even if we can't follow unhex CallExpression", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        function unhex(r) {
            return r;
        }
        const px = require.resolve(unhex("646c2d746172"));
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeImport].sort());
    expect([...dependencies]).toStrictEqual(["dl-tar"]);
});

test("should be capable to reverse the CallExpression Buffer.from with an hexadecimal value as first argument", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const px = require.resolve(
            Buffer.from("646c2d746172", "hex").toString()
        );
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeImport].sort());
    expect([...dependencies]).toStrictEqual(["dl-tar"]);
});

test("should return an unsafe-assign warning when a protected global is assigned to a variable", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const r = require.resolve;
        r("http");
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeAssign].sort());
    expect([...dependencies]).toStrictEqual(["http"]);
});

test("should succesfully follow the require stmt when assigned multiple times and then used to require a dependency", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const r = require;
        const b = r;
        b("http");
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeAssign, Warnings.unsafeAssign].sort());
    expect([...dependencies]).toStrictEqual(["http"]);
});

test("should return unsafe-import when trying to require an empty ArrayExpression (or empty Literal)", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        require(["", ""]);
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeImport].sort());
    expect([...dependencies]).toStrictEqual([]);
});

test("should detect unsafe eval statments", () => {
    const { warnings } = runASTAnalysis(`
        eval("this");
        const g = eval("this");
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeStmt, Warnings.unsafeStmt].sort());
});

test("should detect unsafe Function statments", () => {
    const { warnings } = runASTAnalysis(`
        Function("return this")();
        const g = Function("return this")();
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeStmt, Warnings.unsafeStmt].sort());
});

test("should detect unsafe-assign of eval", () => {
    const { warnings } = runASTAnalysis(`
        const e = eval;
    `);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeAssign].sort());
});

test("should be capable of following global parts", () => {
    const { warnings, dependencies } = runASTAnalysis(`
        const g = global.process;
        const r = g.mainModule;
        const c = r.require;
        c("http");
        r.require("fs");
    `);

    expect(getWarningKind(warnings)).toStrictEqual([
        Warnings.unsafeAssign, Warnings.unsafeAssign, Warnings.unsafeAssign
    ].sort());
    expect([...dependencies]).toStrictEqual(["http", "fs"]);
});

test("should return runtime dependencies concatened when done in a ArrayExpression", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const foo = "bar";

        require.resolve("http");
        require(["net", "-", "tcp"]);
        require([foo, "world"]);
        require([104,101,108,108,111]);

        process.mainModule.require("util");
    `);

    expect(warnings.length).toStrictEqual(0);
    expect([...dependencies]).toStrictEqual(["http", "net-tcp", "barworld", "hello", "util"]);
});

test("should detect the suspicious string", () => {
    const suspectString = readFileSync(join(FIXTURE_PATH, "suspect-string.js"), "utf-8");
    const { warnings, stringScore } = runASTAnalysis(suspectString);

    expect(getWarningKind(warnings)).toStrictEqual([Warnings.suspiciousLiteral].sort());
    expect(stringScore).toStrictEqual(7);
});

test("should be capable to follow hexa computation members expr", () => {
    const advancedComputation = readFileSync(join(FIXTURE_PATH, "advanced-computation.js"), "utf-8");
    const { warnings, dependencies } = runASTAnalysis(advancedComputation);

    expect(getWarningKind(warnings)).toStrictEqual([
        Warnings.encodedLiteral,
        Warnings.unsafeAssign,
        Warnings.unsafeAssign,
        Warnings.unsafeImport,
        Warnings.unsafeStmt
    ].sort());
    expect([...dependencies]).toStrictEqual(["./test/data"]);
});

test("should support runtime analysis of ESM and return http", () => {
    const esm = readFileSync(join(FIXTURE_PATH, "esm.js"), "utf-8");
    const { dependencies, warnings } = runASTAnalysis(esm, { module: true });

    expect(warnings.length).toStrictEqual(0);
    expect([...dependencies]).toStrictEqual(["http"]);
});

test("should detect two unsafe regex", () => {
    const unsafeRegex = readFileSync(join(FIXTURE_PATH, "unsafe-regex.js"), "utf-8");
    const { warnings } = runASTAnalysis(unsafeRegex, { module: false });
    expect(getWarningKind(warnings)).toStrictEqual([Warnings.unsafeRegex, Warnings.unsafeRegex].sort());
});

test("should detect short identifiers!", () => {
    const shortIds = readFileSync(join(FIXTURE_PATH, "short-ids.js"), "utf-8");
    const { warnings } = runASTAnalysis(shortIds);
    expect(getWarningKind(warnings)).toStrictEqual([Warnings.shortIdentifiers].sort());
});

test("should detect that http is under a TryStatement", () => {
    const trycatch = readFileSync(join(FIXTURE_PATH, "try-catch.js"), "utf-8");
    const { dependencies: deps } = runASTAnalysis(trycatch);

    expect(Reflect.has(deps.dependencies, "http")).toStrictEqual(true);
    expect(deps.dependencies.http.inTry).toStrictEqual(true);
});

test("should return isOneLineRequire true for a one liner CJS export", () => {
    const { dependencies, isOneLineRequire } = runASTAnalysis("module.exports = require('foo');");

    expect(isOneLineRequire).toStrictEqual(true);
    expect([...dependencies]).toStrictEqual(["foo"]);
});

test("should be capable to follow require assign", () => {
    const { dependencies } = runASTAnalysis(`
        const b = require;
        b("fs");
    `);

    expect([...dependencies]).toStrictEqual(["fs"]);
});

