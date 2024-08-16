/* eslint-disable max-nested-callbacks */
// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

// Import Internal Dependencies
import { AstAnalyser, JsSourceParser } from "../index.js";
import { FakeSourceParser } from "./fixtures/FakeSourceParser.js";
import { SourceFile } from "../src/SourceFile.js";
import {
  customProbes,
  getWarningKind,
  kIncriminedCodeSampleCustomProbe,
  kWarningUnsafeDanger,
  kWarningUnsafeImport,
  kWarningUnsafeStmt
} from "./utils/index.js";

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

    it("should append to list of probes (default)", () => {
      const analyser = new AstAnalyser({ customParser: new JsSourceParser(), customProbes });
      const result = analyser.analyse(kIncriminedCodeSampleCustomProbe);

      assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
      assert.equal(result.warnings[1].kind, kWarningUnsafeImport);
      assert.equal(result.warnings[2].kind, kWarningUnsafeStmt);
      assert.equal(result.warnings.length, 3);
    });

    it("should replace list of probes", () => {
      const analyser = new AstAnalyser({
        parser: new JsSourceParser(),
        customProbes,
        skipDefaultProbes: true
      });
      const result = analyser.analyse(kIncriminedCodeSampleCustomProbe);

      assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
      assert.equal(result.warnings.length, 1);
    });

    it("should call with the expected arguments", (t) => {
      t.mock.method(AstAnalyser.prototype, "analyse");

      const source = "const http = require(\"http\");";
      new AstAnalyser().analyse(source, { module: true, removeHTMLComments: true });

      const source2 = "const fs = require(\"fs\");";
      new AstAnalyser().analyse(source2, { module: false, removeHTMLComments: false });

      const calls = AstAnalyser.prototype.analyse.mock.calls;
      assert.strictEqual(calls.length, 2);

      assert.deepEqual(calls[0].arguments, [source, { module: true, removeHTMLComments: true }]);
      assert.deepEqual(calls[1].arguments, [source2, { module: false, removeHTMLComments: false }]);
    });

    describe("hooks", () => {
      describe("initialize", () => {
        const analyser = new AstAnalyser();

        it("should throw if initialize is not a function", () => {
          assert.throws(() => {
            analyser.analyse("const foo = 'bar';", {
              initialize: "foo"
            });
          }, /options.initialize must be a function/);
        });

        it("should call the initialize function", (t) => {
          const initialize = t.mock.fn();

          analyser.analyse("const foo = 'bar';", {
            initialize
          });

          assert.strictEqual(initialize.mock.callCount(), 1);
        });

        it("should pass the source file as first argument", (t) => {
          const initialize = t.mock.fn();

          analyser.analyse("const foo = 'bar';", {
            initialize
          });

          assert.strictEqual(initialize.mock.calls[0].arguments[0] instanceof SourceFile, true);
        });
      });

      describe("finalize", () => {
        const analyser = new AstAnalyser();
        it("should throw if finalize is not a function", () => {
          assert.throws(() => {
            analyser.analyse("const foo = 'bar';", {
              finalize: "foo"
            });
          }, /options.finalize must be a function/);
        });

        it("should call the finalize function", (t) => {
          const finalize = t.mock.fn();

          analyser.analyse("const foo = 'bar';", {
            finalize
          });

          assert.strictEqual(finalize.mock.callCount(), 1);
        });

        it("should pass the source file as first argument", (t) => {
          const finalize = t.mock.fn();

          analyser.analyse("const foo = 'bar';", {
            finalize
          });

          assert.strictEqual(finalize.mock.calls[0].arguments[0] instanceof SourceFile, true);
        });
      });

      it("intialize should be called before finalize", () => {
        const calls = [];
        const analyser = new AstAnalyser();

        analyser.analyse("const foo = 'bar';", {
          initialize: () => calls.push("initialize"),
          finalize: () => calls.push("finalize")
        });

        assert.deepEqual(calls, ["initialize", "finalize"]);
      });
    });
  });

  describe("analyseFile", () => {
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

    it("should call the method with the expected arguments", async(t) => {
      t.mock.method(AstAnalyser.prototype, "analyseFile");

      const url = new URL("depName.js", FIXTURE_URL);
      await new AstAnalyser().analyseFile(
        url,
        { module: false, packageName: "foobar" }
      );

      const url2 = new URL("parsingError.js", FIXTURE_URL);
      await new AstAnalyser().analyseFile(
        url,
        { module: true, packageName: "foobar2" }
      );

      const calls = AstAnalyser.prototype.analyseFile.mock.calls;
      assert.strictEqual(calls.length, 2);

      assert.deepEqual(calls[0].arguments, [url, { module: false, packageName: "foobar" }]);
      assert.deepEqual(calls[1].arguments, [url2, { module: true, packageName: "foobar2" }]);
    });

    it("should implement new customProbes while keeping default probes", async() => {
      const result = await new AstAnalyser(
        {
          parser: new JsSourceParser(),
          customProbes,
          skipDefaultProbes: false
        }
      ).analyseFile(new URL("customProbe.js", FIXTURE_URL));

      assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
      assert.equal(result.warnings[1].kind, kWarningUnsafeImport);
      assert.equal(result.warnings[2].kind, kWarningUnsafeStmt);
      assert.equal(result.warnings.length, 3);
    });

    it("should implement new customProbes while skipping/removing default probes", async() => {
      const result = await new AstAnalyser(
        {
          parser: new JsSourceParser(),
          customProbes,
          skipDefaultProbes: true
        }
      ).analyseFile(new URL("customProbe.js", FIXTURE_URL));

      assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
      assert.equal(result.warnings.length, 1);
    });

    describe("hooks", () => {
      const analyser = new AstAnalyser();
      const url = new URL("depName.js", FIXTURE_URL);

      describe("initialize", () => {
        it("should throw if initialize is not a function", async() => {
          const res = await analyser.analyseFile(
            url, {
              initialize: "foo"
            });

          assert.strictEqual(res.ok, false);
          assert.strictEqual(res.warnings[0].value, "options.initialize must be a function");
          assert.strictEqual(res.warnings[0].kind, "parsing-error");
        });

        it("should call the initialize function", async(t) => {
          const initialize = t.mock.fn();

          await analyser.analyseFile(url, {
            initialize
          });

          assert.strictEqual(initialize.mock.callCount(), 1);
        });

        it("should pass the source file as first argument", async(t) => {
          const initialize = t.mock.fn();

          await analyser.analyseFile(url, {
            initialize
          });

          assert.strictEqual(initialize.mock.calls[0].arguments[0] instanceof SourceFile, true);
        });
      });

      describe("finalize", () => {
        it("should throw if finalize is not a function", async() => {
          const res = await analyser.analyseFile(
            url, {
              finalize: "foo"
            });

          assert.strictEqual(res.ok, false);
          assert.strictEqual(res.warnings[0].value, "options.finalize must be a function");
          assert.strictEqual(res.warnings[0].kind, "parsing-error");
        });

        it("should call the finalize function", async(t) => {
          const finalize = t.mock.fn();

          await analyser.analyseFile(url, {
            finalize
          });

          assert.strictEqual(finalize.mock.callCount(), 1);
        });

        it("should pass the source file as first argument", async(t) => {
          const finalize = t.mock.fn();

          await analyser.analyseFile(url, {
            finalize
          });

          assert.strictEqual(finalize.mock.calls[0].arguments[0] instanceof SourceFile, true);
        });
      });

      it("intialize should be called before finalize", async() => {
        const calls = [];

        await analyser.analyseFile(url, {
          initialize: () => calls.push("initialize"),
          finalize: () => calls.push("finalize")
        });

        assert.deepEqual(calls, ["initialize", "finalize"]);
      });
    });
  });

  describe("analyseFileSync", () => {
    it("remove the packageName from the dependencies list", () => {
      const result = getAnalyser().analyseFileSync(
        new URL("depName.js", FIXTURE_URL),
        { module: false, packageName: "foobar" }
      );

      assert.ok(result.ok);
      assert.strictEqual(result.warnings.length, 0);
      assert.deepEqual([...result.dependencies.keys()],
        ["open"]
      );
    });

    it("should fail with a parsing error", () => {
      const result = getAnalyser().analyseFileSync(
        new URL("parsingError.js", FIXTURE_URL),
        { module: false, packageName: "foobar" }
      );

      assert.strictEqual(result.ok, false);
      assert.strictEqual(result.warnings.length, 1);

      const parsingError = result.warnings[0];
      assert.strictEqual(parsingError.kind, "parsing-error");
    });

    describe("hooks", () => {
      const url = new URL("depName.js", FIXTURE_URL);

      describe("initialize", () => {
        it("should throw if initialize is not a function", () => {
          const res = getAnalyser().analyseFileSync(
            url, {
              initialize: "foo"
            });

          assert.strictEqual(res.ok, false);
          assert.strictEqual(res.warnings[0].value, "options.initialize must be a function");
          assert.strictEqual(res.warnings[0].kind, "parsing-error");
        });

        it("should call the initialize function", (t) => {
          const initialize = t.mock.fn();

          getAnalyser().analyseFileSync(url, {
            initialize
          });

          assert.strictEqual(initialize.mock.callCount(), 1);
        });

        it("should pass the source file as first argument", (t) => {
          const initialize = t.mock.fn();

          getAnalyser().analyseFileSync(url, {
            initialize
          });

          assert.strictEqual(initialize.mock.calls[0].arguments[0] instanceof SourceFile, true);
        });
      });

      describe("finalize", () => {
        it("should throw if finalize is not a function", () => {
          const res = getAnalyser().analyseFileSync(
            url, {
              finalize: "foo"
            });

          assert.strictEqual(res.ok, false);
          assert.strictEqual(res.warnings[0].value, "options.finalize must be a function");
          assert.strictEqual(res.warnings[0].kind, "parsing-error");
        });

        it("should call the finalize function", (t) => {
          const finalize = t.mock.fn();

          getAnalyser().analyseFileSync(url, {
            finalize
          });

          assert.strictEqual(finalize.mock.callCount(), 1);
        });

        it("should pass the source file as first argument", (t) => {
          const finalize = t.mock.fn();

          getAnalyser().analyseFileSync(url, {
            finalize
          });

          assert.strictEqual(finalize.mock.calls[0].arguments[0] instanceof SourceFile, true);
        });
      });

      it("intialize should be called before finalize", () => {
        const calls = [];

        getAnalyser().analyseFileSync(url, {
          initialize: () => calls.push("initialize"),
          finalize: () => calls.push("finalize")
        });

        assert.deepEqual(calls, ["initialize", "finalize"]);
      });
    });
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

  describe("constructor", () => {
    it("should not throw an error when instantiated without a custom parser", () => {
      assert.doesNotThrow(() => {
        const analyser = new AstAnalyser();
        // perform basic operations
        const result = analyser.analyse("const foo = 'bar';");
        // compare array of keys to an empty array to ensure there are no dependencies in result
        assert.deepEqual([...result.dependencies.keys()], []);
      });
    });

    it("should instantiate with correct default options", () => {
      const analyser = new AstAnalyser();
      assert.ok(analyser.parser instanceof JsSourceParser);
      assert.deepStrictEqual(analyser.probesOptions.customProbes, []);
      assert.strictEqual(analyser.probesOptions.skipDefaultProbes, false);
    });

    it("should properly instanciate default or custom parser (using analyseFile)", async(t) => {
      t.mock.method(JsSourceParser.prototype, "parse");
      t.mock.method(FakeSourceParser.prototype, "parse");

      await new AstAnalyser().analyseFile(
        new URL("depName.js", FIXTURE_URL),
        { module: false, packageName: "foobar" }
      );

      await new AstAnalyser(
        { customParser: new FakeSourceParser() }
      ).analyseFile(
        new URL("parsingError.js", FIXTURE_URL),
        { module: true, packageName: "foobar2" }
      );

      assert.strictEqual(JsSourceParser.prototype.parse.mock.calls.length, 1);
      assert.strictEqual(FakeSourceParser.prototype.parse.mock.calls.length, 1);
    });

    it("should properly instanciate default or custom parser (using analyse)", (t) => {
      t.mock.method(JsSourceParser.prototype, "parse");
      t.mock.method(FakeSourceParser.prototype, "parse");

      new AstAnalyser().analyse("const http = require(\"http\");", { module: true, removeHTMLComments: true });

      new AstAnalyser({
        customParser: new FakeSourceParser()
      }).analyse("const fs = require(\"fs\");",
        { module: false, removeHTMLComments: false }
      );

      assert.strictEqual(JsSourceParser.prototype.parse.mock.calls.length, 1);
      assert.strictEqual(FakeSourceParser.prototype.parse.mock.calls.length, 1);
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
