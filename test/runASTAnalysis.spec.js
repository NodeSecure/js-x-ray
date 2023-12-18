// Import Node.js Dependencies
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysis } from "../index.js";
import { getWarningKind } from "./utils/index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

test("it should return all dependencies required at runtime", () => {
  const { dependencies, warnings } = runASTAnalysis(`
    const http = require("http");
    const net = require("net");
    const fs = require("fs").promises;

    require("assert").strictEqual;
    require("timers");
    require("./aFile.js");

    const myVar = "path";
    require(myVar);
  `, { module: false });

  assert.strictEqual(warnings.length, 0);
  assert.deepEqual([...dependencies.keys()],
    ["http", "net", "fs", "assert", "timers", "./aFile.js", "path"]
  );
});

test("it should throw a 'suspicious-literal' warning when given a code with a suspicious string", () => {
  const suspectString = readFileSync(
    new URL("suspect-string.js", FIXTURE_URL),
    "utf-8"
  );
  const { warnings, stringScore } = runASTAnalysis(suspectString);

  assert.deepEqual(
    getWarningKind(warnings),
    ["suspicious-literal"].sort()
  );
  assert.strictEqual(stringScore, 8);
});

test("it should throw a 'suspicious-file' warning because the file contains to much encoded-literal warnings", () => {
  const suspectString = readFileSync(
    new URL("suspiciousFile.js", FIXTURE_URL),
    "utf-8"
  );
  const { warnings } = runASTAnalysis(suspectString);

  assert.deepEqual(
    getWarningKind(warnings),
    ["suspicious-file"].sort()
  );
});

test("it should combine same encoded-literal as one warning with multiple locations", () => {
  const { warnings } = runASTAnalysis(`
    const foo = "18c15e5c5c9dac4d16f9311a92bb8331";
    const bar = "18c15e5c5c9dac4d16f9311a92bb8331";
    const xd = "18c15e5c5c9dac4d16f9311a92bb8331";
  `);

  assert.strictEqual(warnings.length, 1);
  assert.deepEqual(
    getWarningKind(warnings),
    ["encoded-literal"].sort()
  );

  const [encodedLiteral] = warnings;
  assert.strictEqual(encodedLiteral.location.length, 3);
});

test("it should be capable to follow a malicious code with hexa computation and reassignments", () => {
  const { warnings, dependencies } = runASTAnalysis(`
    function unhex(r) {
      return Buffer.from(r, "hex").toString();
    }

    const g = eval("this");
    const p = g["pro" + "cess"];

    const evil = p["mainMod" + "ule"][unhex("72657175697265")];
    const work = evil(unhex("2e2f746573742f64617461"));
  `);

  assert.deepEqual(getWarningKind(warnings), [
    "encoded-literal",
    "unsafe-import",
    "unsafe-stmt"
  ].sort());
  assert.deepEqual([...dependencies.keys()], ["./test/data"]);
});

test("it should throw a 'short-identifiers' warning for a code with only one-character identifiers", () => {
  const { warnings } = runASTAnalysis(`
    var a = 0, b, c, d;
    for (let i = 0; i < 10; i++) {
      a += i;
    }
    let de = "foo";
    let x, z;
  `);

  assert.deepEqual(getWarningKind(warnings), ["short-identifiers"].sort());
});

test("it should detect dependency required under a TryStatement", () => {
  const { dependencies } = runASTAnalysis(`
    try {
      require("http");
    }
    catch {}
  `);

  assert.ok(dependencies.has("http"));
  assert.ok(dependencies.get("http").inTry);
});

test("it should return isOneLineRequire true given a single line CJS export", () => {
  const { dependencies, isOneLineRequire } = runASTAnalysis(
    "module.exports = require('foo');"
  );

  assert.ok(isOneLineRequire);
  assert.deepEqual([...dependencies.keys()], ["foo"]);
});
