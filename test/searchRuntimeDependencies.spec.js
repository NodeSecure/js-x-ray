// Import Node.js Dependencies
import { readFileSync } from "node:fs";

// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { runASTAnalysis } from "../index.js";
import { getWarningKind } from "./utils/index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

test("it should return all dependencies required at runtime", (tape) => {
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

  tape.strictEqual(warnings.length, 0);
  tape.deepEqual([...dependencies],
    ["http", "net", "fs", "assert", "timers", "./aFile.js", "path"]
  );
  tape.end();
});

test("it should throw a 'suspicious-literal' warning when given a code with a suspicious string", (tape) => {
  const suspectString = readFileSync(new URL("suspect-string.js", FIXTURE_URL), "utf-8");
  const { warnings, stringScore } = runASTAnalysis(suspectString);

  tape.deepEqual(getWarningKind(warnings), ["suspicious-literal"].sort());
  tape.strictEqual(stringScore, 8);
  tape.end();
});

test("it should be capable to follow a malicious code with hexa computation and reassignments", (tape) => {
  const { warnings, dependencies } = runASTAnalysis(`
    function unhex(r) {
      return Buffer.from(r, "hex").toString();
    }

    const g = eval("this");
    const p = g["pro" + "cess"];

    const evil = p["mainMod" + "ule"][unhex("72657175697265")];
    const work = evil(unhex("2e2f746573742f64617461"));
  `);

  tape.deepEqual(getWarningKind(warnings), [
    "encoded-literal",
    "unsafe-import",
    "unsafe-stmt"
  ].sort());
  tape.deepEqual([...dependencies], ["./test/data"]);

  tape.end();
});

test("it should throw a 'short-identifiers' warning for a code with only one-character identifiers", (tape) => {
  const { warnings } = runASTAnalysis(`
    var a = 0, b, c, d;
    for (let i = 0; i < 10; i++) {
      a += i;
    }
    let de = "foo";
    let x, z;
  `);

  tape.deepEqual(getWarningKind(warnings), ["short-identifiers"].sort());
  tape.end();
});

test("it should detect dependency required under a TryStatement", (tape) => {
  const { dependencies: deps } = runASTAnalysis(`
    try {
      require("http");
    }
    catch {}
  `);

  tape.ok(Reflect.has(deps.dependencies, "http"));
  tape.ok(deps.dependencies.http.inTry);
  tape.end();
});

test("it should return isOneLineRequire true given a single line CJS export", (tape) => {
  const { dependencies, isOneLineRequire } = runASTAnalysis("module.exports = require('foo');");

  tape.ok(isOneLineRequire);
  tape.deepEqual([...dependencies], ["foo"]);
  tape.end();
});
