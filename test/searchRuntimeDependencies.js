"use strict";

// Require Node.js Dependencies
const { readFileSync } = require("fs");
const { join } = require("path");

// Require Internal Dependencies
const { runASTAnalysis } = require("..");

// CONSTANTS
const FIXTURE_PATH = join(__dirname, "fixtures/searchRuntimeDependencies");

// Payloads
const trycatch = readFileSync(join(FIXTURE_PATH, "try-catch.js"), "utf-8");
const esm = readFileSync(join(FIXTURE_PATH, "esm.js"), "utf-8");
const unsafeRegex = readFileSync(join(FIXTURE_PATH, "unsafe-regex.js"), "utf-8");
const suspectString = readFileSync(join(FIXTURE_PATH, "suspect-string.js"), "utf-8");

test("should return runtime dependencies for one.js", () => {
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

test("should return runtime dependencies for two.js", () => {
    const { dependencies, warnings } = runASTAnalysis(`const myVar = "ht";
    require(myVar + "tp");
    require("eve" + "nt" + "s");
    `);

    expect(warnings.length).toStrictEqual(0);
    expect([...dependencies]).toStrictEqual(["http", "events"]);
});

test("should return isSuspect = true for three.js", () => {
    const { dependencies, warnings, isOneLineRequire } = runASTAnalysis(`
        function evil() {
            return "http";
        }
        require(evil());
        require(evil() + "s");
    `);

    expect(warnings.length).toStrictEqual(2);
    expect(isOneLineRequire).toStrictEqual(false);
    expect([...dependencies]).toStrictEqual([]);
});

test("should parse hexa value", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const boo = "796f6f6f6c6f";
        const foo = "68747470";
    `);

    expect(warnings.length).toStrictEqual(2);
    expect([...dependencies]).toStrictEqual(["http"]);
});

test("should parse the Buffer.from call with an Array Expr", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const px = require.resolve(
            Buffer.from([100, 108, 45, 116, 97, 114]).toString()
        );
    `);

    expect(warnings.length).toStrictEqual(1);
    expect([...dependencies]).toStrictEqual(["dl-tar"]);
});

test("should parse the Buffer.from call with an hexa value", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const px = require.resolve(
            Buffer.from("646c2d746172", "hex").toString()
        );
    `);

    expect(warnings.length).toStrictEqual(1);
    expect([...dependencies]).toStrictEqual(["dl-tar"]);
});

test("should return an unsafe assign for a memberExpr", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const r = require.resolve;
        r("http");
    `);

    expect(warnings.length).toStrictEqual(1);
    expect([...dependencies]).toStrictEqual(["http"]);
});

test("should succesfully follow the require stmt", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        const r = require;
        const b = r;
        b("http");
    `);

    expect(warnings.length).toStrictEqual(2);
    expect([...dependencies]).toStrictEqual(["http"]);
});

test("should succesfully follow the require stmt", () => {
    const { dependencies, warnings } = runASTAnalysis(`
        require(["", ""]);
    `);

    expect(warnings.length).toStrictEqual(1);
    expect([...dependencies]).toStrictEqual([]);
});

test("should return runtime dependencies for five.js", () => {
    const { dependencies, warnings } = runASTAnalysis(`
    const foo = "bar";

    require.resolve("http");
    require(["net", "-", "tcp"]);
    require([foo, "world"]);
    require([104,101,108,108,111]);

    process.mainModule.require("util");`);

    expect(warnings.length).toStrictEqual(0);
    expect([...dependencies]).toStrictEqual(["http", "net-tcp", "barworld", "hello", "util"]);
});

test("should support runtime analysis of ESM and return http", () => {
    const { warnings, stringScore } = runASTAnalysis(suspectString);

    expect(warnings.length).toStrictEqual(1);
    expect(stringScore).toStrictEqual(7);
});

test("should support runtime analysis of ESM and return http", () => {
    const { dependencies, warnings } = runASTAnalysis(esm, { module: true });

    expect(warnings.length).toStrictEqual(0);
    expect([...dependencies]).toStrictEqual(["http"]);
});

test("should detect two unsafe regex", () => {
    const { warnings } = runASTAnalysis(unsafeRegex, { module: false });

    expect(warnings.length).toStrictEqual(2);
    expect(warnings[0].kind === "unsafe-regex").toBe(true);
    expect(warnings[1].kind === "unsafe-regex").toBe(true);
});


test("should detect that http is under a TryStatement", () => {
    const { dependencies: deps } = runASTAnalysis(trycatch);

    expect(Reflect.has(deps.dependencies, "http")).toStrictEqual(true);
    expect(deps.dependencies.http.inTry).toStrictEqual(true);
});

test("should return isOneLineRequire true for a one liner CJS export", () => {
    const { dependencies, isOneLineRequire } = runASTAnalysis("module.exports = require('foo');");

    expect(isOneLineRequire).toStrictEqual(true);
    expect([...dependencies]).toStrictEqual(["foo"]);
});
