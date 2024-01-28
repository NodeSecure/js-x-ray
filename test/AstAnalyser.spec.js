// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

// Import Internal Dependencies
import { AstAnalyser } from "../src/AstAnalyser.js";
import { JsSourceParser } from "../src/JsSourceParser.js";
import { getWarningKind } from "./utils/index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

describe("AstAnalyser", (t) => {
  describe("analyse", () => {
    it("should return all dependencies required at runtime", () => {
      const { dependencies, warnings } = getAnalyser().analyse(`
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

    it("should throw a 'suspicious-literal' warning when given a code with a suspicious string", () => {
      const suspectString = readFileSync(
        new URL("suspect-string.js", FIXTURE_URL),
        "utf-8"
      );
      const { warnings, stringScore } = getAnalyser().analyse(suspectString);

      assert.deepEqual(
        getWarningKind(warnings),
        ["suspicious-literal"].sort()
      );
      assert.strictEqual(stringScore, 8);
    });

    it("should throw a 'suspicious-file' warning because the file contains to much encoded-literal warnings", () => {
      const suspectString = readFileSync(
        new URL("suspiciousFile.js", FIXTURE_URL),
        "utf-8"
      );
      const { warnings } = getAnalyser().analyse(suspectString);

      assert.deepEqual(
        getWarningKind(warnings),
        ["suspicious-file"].sort()
      );
    });

    it("should combine same encoded-literal as one warning with multiple locations", () => {
      const { warnings } = getAnalyser().analyse(`
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

    it("should be capable to follow a malicious code with hexa computation and reassignments", () => {
      const { warnings, dependencies } = getAnalyser().analyse(`
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

    it("should throw a 'short-identifiers' warning for a code with only one-character identifiers", () => {
      const { warnings } = getAnalyser().analyse(`
    var a = 0, b, c, d;
    for (let i = 0; i < 10; i++) {
      a += i;
    }
    let de = "foo";
    let x, z;
  `);

      assert.deepEqual(getWarningKind(warnings), ["short-identifiers"].sort());
    });

    it("should detect dependency required under a TryStatement", () => {
      const { dependencies } = getAnalyser().analyse(`
    try {
      require("http");
    }
    catch {}
  `);

      assert.ok(dependencies.has("http"));
      assert.ok(dependencies.get("http").inTry);
    });

    it("should return isOneLineRequire true given a single line CJS export", () => {
      const { dependencies, isOneLineRequire } = getAnalyser().analyse(
        "module.exports = require('foo');"
      );

      assert.ok(isOneLineRequire);
      assert.deepEqual([...dependencies.keys()], ["foo"]);
    });

    it("should be capable to extract dependencies name for ECMAScript Modules (ESM)", () => {
      const { dependencies, warnings } = getAnalyser().analyse(`
    import * as http from "http";
    import fs from "fs";
    import { foo } from "xd";
  `, { module: true });

      assert.strictEqual(warnings.length, 0);
      assert.deepEqual(
        [...dependencies.keys()].sort(),
        ["http", "fs", "xd"].sort()
      );
    });
  });

  it("remove the packageName from the dependencies list", async() => {
    const result = await getAnalyser().analyseFile(
      new URL("depName.js", FIXTURE_URL),
      { module: false, packageName: "foobar" }
    );

    assert.ok(result.ok);
    assert.strictEqual(result.warnings.length, 0);
    assert.deepEqual([...result.dependencies.keys()],
      ["open"]
    );
  });

  it("should fail with a parsing error", async() => {
    const result = await getAnalyser().analyseFile(
      new URL("parsingError.js", FIXTURE_URL),
      { module: false, packageName: "foobar" }
    );

    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.warnings.length, 1);

    const parsingError = result.warnings[0];
    assert.strictEqual(parsingError.kind, "parsing-error");
  });

  describe("prepareSource", () => {
    it("should remove shebang at the start of the file", (t) => {
      const source = "#!/usr/bin/env node\nconst hello = \"world\";";
      const preparedSource = getAnalyser().prepareSource(source);

      assert.strictEqual(
        preparedSource,
        "const hello = \"world\";"
      );
    });

    it("should not remove shebang if not at the start (that's an illegal code)", () => {
      const source = "const hello = \"world\";\n#!/usr/bin/env node";
      const preparedSource = getAnalyser().prepareSource(source);

      assert.strictEqual(
        preparedSource,
        source
      );
    });

    it("should remove singleline HTML comment from source code when removeHTMLComments is enabled", () => {
      const preparedSource = getAnalyser().prepareSource("<!-- const yo = 5; -->", {
        removeHTMLComments: true
      });

      assert.strictEqual(preparedSource, "");
    });

    it("should remove multiline HTML comment from source code when removeHTMLComments is enabled", () => {
      const preparedSource = getAnalyser().prepareSource(`
      <!--
    // == fake comment == //
  
    const yo = 5;
    //-->
    `, {
        removeHTMLComments: true
      });

      assert.strictEqual(preparedSource.trim(), "");
    });

    it("should remove multiple HTML comments", () => {
      const preparedSource = getAnalyser().prepareSource(
        "<!-- const yo = 5; -->\nconst yo = 'foo'\n<!-- const yo = 5; -->", {
          removeHTMLComments: true
        });

      assert.strictEqual(preparedSource, "\nconst yo = 'foo'\n");
    });
  });
});

let analyser = null;
function getAnalyser() {
  if (!analyser) {
    analyser = new AstAnalyser(new JsSourceParser());
  }

  return analyser;
}
