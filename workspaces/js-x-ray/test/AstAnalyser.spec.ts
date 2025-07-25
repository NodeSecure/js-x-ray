/* eslint-disable max-nested-callbacks */
// Import Node.js Dependencies
import { describe, it, TestContext } from "node:test";
import assert from "node:assert";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Import Internal Dependencies
import { AstAnalyser, JsSourceParser } from "../src/index.js";
import { FakeSourceParser } from "./fixtures/FakeSourceParser.js";
import { ProbeRunner } from "../src/ProbeRunner.js";
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
const kFixtureURL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

describe("AstAnalyser", () => {
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
        new URL("suspect-string.js", kFixtureURL),
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
        new URL("suspiciousFile.js", kFixtureURL),
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
      assert.strictEqual(encodedLiteral.location?.length, 3);
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
      assert.ok(dependencies.get("http")!.inTry);
    });

    it("should return isOneLineRequire true given a single line CJS export", () => {
      const { dependencies, flags } = getAnalyser().analyse(
        "module.exports = require('foo');"
      );

      assert.ok(flags.has("oneline-require"));
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
      const analyser = new AstAnalyser({
        customParser: new JsSourceParser(),
        customProbes
      });
      const result = analyser.analyse(kIncriminedCodeSampleCustomProbe);

      assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
      assert.equal(result.warnings[1].kind, kWarningUnsafeImport);
      assert.equal(result.warnings[2].kind, kWarningUnsafeStmt);
      assert.equal(result.warnings.length, 3);
    });

    it("should replace list of probes", () => {
      const analyser = new AstAnalyser({
        customParser: new JsSourceParser(),
        customProbes,
        skipDefaultProbes: true
      });
      const result = analyser.analyse(kIncriminedCodeSampleCustomProbe);

      assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
      assert.equal(result.warnings.length, 1);
    });

    it("should call with the expected arguments", (t) => {
      const astAnalyserMock = t.mock.method(AstAnalyser.prototype, "analyse");

      const source = "const http = require(\"http\");";
      new AstAnalyser().analyse(source, { module: true, removeHTMLComments: true });

      const source2 = "const fs = require(\"fs\");";
      new AstAnalyser().analyse(source2, { module: false, removeHTMLComments: false });

      const calls = astAnalyserMock.mock.calls;
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
              // @ts-expect-error
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
              // @ts-expect-error
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
        const calls: string[] = [];
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
        new URL("depName.js", kFixtureURL),
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
        new URL("parsingError.js", kFixtureURL),
        { module: false, packageName: "foobar" }
      );

      assert.strictEqual(result.ok, false);
      assert.strictEqual(result.warnings.length, 1);

      const parsingError = result.warnings[0];
      assert.strictEqual(parsingError.kind, "parsing-error");
    });

    it("should call the method with the expected arguments", async(t) => {
      const astAnalyserMock = t.mock.method(AstAnalyser.prototype, "analyseFile");

      const url = new URL("depName.js", kFixtureURL);
      await new AstAnalyser().analyseFile(
        url,
        { module: false, packageName: "foobar" }
      );

      const url2 = new URL("parsingError.js", kFixtureURL);
      await new AstAnalyser().analyseFile(
        url2,
        { module: true, packageName: "foobar2" }
      );

      const calls = astAnalyserMock.mock.calls;
      assert.strictEqual(calls.length, 2);

      assert.deepEqual(calls[0].arguments, [url, { module: false, packageName: "foobar" }]);
      assert.deepEqual(calls[1].arguments, [url2, { module: true, packageName: "foobar2" }]);
    });

    it("should implement new customProbes while keeping default probes", async() => {
      const result = await new AstAnalyser(
        {
          customParser: new JsSourceParser(),
          customProbes,
          skipDefaultProbes: false
        }
      ).analyseFile(new URL("customProbe.js", kFixtureURL));

      assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
      assert.equal(result.warnings[1].kind, kWarningUnsafeImport);
      assert.equal(result.warnings[2].kind, kWarningUnsafeStmt);
      assert.equal(result.warnings.length, 3);
    });

    it("should implement new customProbes while skipping/removing default probes", async() => {
      const result = await new AstAnalyser(
        {
          customParser: new JsSourceParser(),
          customProbes,
          skipDefaultProbes: true
        }
      ).analyseFile(new URL("customProbe.js", kFixtureURL));

      assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
      assert.equal(result.warnings.length, 1);
    });

    it("should call initialize and finalize of every probes at the end", async(t) => {
      const calls: string[] = [];
      await new AstAnalyser(
        {
          customParser: new JsSourceParser(),
          customProbes: [
            {
              name: "name",
              initialize: () => {
                calls.push("initialize");
              },
              validateNode: () => [true],
              main: t.mock.fn(),
              finalize: () => calls.push("finalize")
            },
            {
              name: "classic probe",
              validateNode: () => [true],
              main: t.mock.fn()
            }

          ],
          skipDefaultProbes: true
        }
      ).analyseFile(new URL("customProbe.js", kFixtureURL));

      assert.deepEqual(calls, ["initialize", "finalize"]);
    });

    describe("hooks", () => {
      const analyser = new AstAnalyser();
      const url = new URL("depName.js", kFixtureURL);

      describe("initialize", () => {
        it("should throw if initialize is not a function", async() => {
          const res = await analyser.analyseFile(url, {
            // @ts-expect-error
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
          const res = await analyser.analyseFile(url, {
            // @ts-expect-error
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
        const calls: string[] = [];

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
        new URL("depName.js", kFixtureURL),
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
        new URL("parsingError.js", kFixtureURL),
        { module: false, packageName: "foobar" }
      );

      assert.strictEqual(result.ok, false);
      assert.strictEqual(result.warnings.length, 1);

      const parsingError = result.warnings[0];
      assert.strictEqual(parsingError.kind, "parsing-error");
    });

    it("should include flags property in response", () => {
      const result = getAnalyser().analyseFileSync(
        new URL("depName.js", kFixtureURL)
      );

      assert.ok(result.ok);
      assert.ok(result.flags instanceof Set);
    });

    it("should add is-minified flag for minified files", (t: TestContext) => {
      t.plan(3);
      const minifiedContent = "var a=require(\"fs\"),b=require(\"http\");" +
        "a.readFile(\"test.txt\",function(c,d){b.createServer().listen(3000)});";
      const tempMinFile = path.join(os.tmpdir(), "temp-test.min.js");

      writeFileSync(tempMinFile, minifiedContent);

      try {
        const result = getAnalyser().analyseFileSync(tempMinFile);

        t.assert.ok(result.ok);
        if (result.ok) {
          t.assert.ok(result.flags.has("is-minified"));
          t.assert.strictEqual(result.flags.has("oneline-require"), false);
        }
      }
      finally {
        unlinkSync(tempMinFile);
      }
    });

    it("should add oneline-require flag for one-line exports", (t: TestContext) => {
      t.plan(4);
      const oneLineContent = "module.exports = require('foo');";
      const tempOneLineFile = path.join(os.tmpdir(), "temp-oneline.js");

      writeFileSync(tempOneLineFile, oneLineContent);

      try {
        const result = getAnalyser().analyseFileSync(tempOneLineFile);

        t.assert.ok(result.ok);
        t.assert.ok(result.flags.has("oneline-require"));
        t.assert.strictEqual(result.flags.has("is-minified"), false);
        t.assert.deepEqual([...result.dependencies.keys()], ["foo"]);
      }
      finally {
        unlinkSync(tempOneLineFile);
      }
    });

    describe("hooks", () => {
      const url = new URL("depName.js", kFixtureURL);

      describe("initialize", () => {
        it("should throw if initialize is not a function", () => {
          const res = getAnalyser().analyseFileSync(url, {
            // @ts-expect-error
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
          const res = getAnalyser()
            .analyseFileSync(url, {
              // @ts-expect-error
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
        const calls: string[] = [];

        getAnalyser().analyseFileSync(url, {
          initialize: () => calls.push("initialize"),
          finalize: () => calls.push("finalize")
        });

        assert.deepEqual(calls, ["initialize", "finalize"]);
      });
    });
  });

  describe("prepareSource", () => {
    it("should remove shebang at the start of the file", () => {
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
      assert.deepStrictEqual(analyser.probes, ProbeRunner.Defaults);
    });

    it("should properly instanciate default or custom parser (using analyseFile)", async(t) => {
      const jsSourceParserMock = t.mock.method(JsSourceParser.prototype, "parse");
      const fakeSourceParserMock = t.mock.method(FakeSourceParser.prototype, "parse");

      await new AstAnalyser().analyseFile(
        new URL("depName.js", kFixtureURL),
        { module: false, packageName: "foobar" }
      );

      await new AstAnalyser(
        { customParser: new FakeSourceParser() }
      ).analyseFile(
        new URL("parsingError.js", kFixtureURL),
        { module: true, packageName: "foobar2" }
      );

      assert.strictEqual(
        jsSourceParserMock.mock.calls.length,
        1
      );
      assert.strictEqual(
        fakeSourceParserMock.mock.calls.length,
        1
      );
    });

    it("should properly instanciate default or custom parser (using analyse)", (t) => {
      const jsSourceParserMock = t.mock.method(JsSourceParser.prototype, "parse");
      const fakeSourceParserMock = t.mock.method(FakeSourceParser.prototype, "parse");

      new AstAnalyser().analyse("const http = require(\"http\");", { module: true, removeHTMLComments: true });

      new AstAnalyser({
        customParser: new FakeSourceParser()
      }).analyse("const fs = require(\"fs\");",
        { module: false, removeHTMLComments: false }
      );

      assert.strictEqual(
        jsSourceParserMock.mock.calls.length,
        1
      );
      assert.strictEqual(
        fakeSourceParserMock.mock.calls.length,
        1
      );
    });
  });

  describe("optional warnings", () => {
    it("should not crash when there is an unknown optional warning", () => {
      new AstAnalyser({
        // @ts-expect-error
        optionalWarnings: ["unknown"]
      }).analyse("");
    });
  });
});

let analyser: AstAnalyser | null = null;
function getAnalyser(): NonNullable<AstAnalyser> {
  if (!analyser) {
    analyser = new AstAnalyser({
      customParser: new JsSourceParser()
    });
  }

  return analyser;
}
