/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines */
// Import Node.js Dependencies
import assert from "node:assert";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, type TestContext } from "node:test";

// Import Internal Dependencies
import { AstAnalyser, type Dependency, JsSourceParser } from "../src/index.ts";
import { ProbeRunner } from "../src/ProbeRunner.ts";
import { SourceFile } from "../src/SourceFile.ts";
import { FakeSourceParser } from "./fixtures/FakeSourceParser.ts";
import {
  customProbes,
  getWarningKind,
  kIncriminedCodeSampleCustomProbe,
  kWarningUnsafeDanger,
  kWarningUnsafeImport,
  kWarningUnsafeStmt,
  extractDependencies
} from "./helpers.ts";
import { DefaultCollectableSet } from "../src/CollectableSet.ts";

// CONSTANTS
const kFixtureURL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

describe("AstAnalyser", () => {
  it("should have a default parser instance of JsSourceParser", () => {
    assert.ok(AstAnalyser.DefaultParser instanceof JsSourceParser);
  });

  describe("analyse", () => {
    it("should return all dependencies required at runtime", () => {
      const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
      const { warnings } = new AstAnalyser({
        collectables: [dependencySet]
      }).analyse(`
    const http = require("http");
    const net = require("net");
    const fs = require("fs").promises;

    require("assert").strictEqual;
    require("timers");
    require("./aFile.js");

    const myVar = "path";
    require(myVar);
  `);

      assert.strictEqual(warnings.length, 0);
      assert.deepEqual([...extractDependencies(dependencySet).keys()],
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
      const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
      const { warnings } = new AstAnalyser({ collectables: [dependencySet] }).analyse(`
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
      assert.deepEqual([...extractDependencies(dependencySet).keys()], ["./test/data"]);
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
      const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
      new AstAnalyser({ collectables: [dependencySet] }).analyse(`
    try {
      require("http");
    }
    catch {}
  `);

      const dependencies = extractDependencies(dependencySet);

      assert.ok(dependencies.has("http"));
      assert.ok(dependencies.get("http")!.inTry);
    });

    it("should return isOneLineRequire true given a single line CJS export", () => {
      const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
      const { flags } = new AstAnalyser({ collectables: [dependencySet] }).analyse(
        "module.exports = require('foo');"
      );

      assert.ok(flags.has("oneline-require"));
      assert.deepEqual([...extractDependencies(dependencySet).keys()], ["foo"]);
    });

    it("should be capable to extract dependencies name for ECMAScript Modules (ESM)", () => {
      const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
      const { warnings } = new AstAnalyser({ collectables: [dependencySet] }).analyse(`
    import * as http from "http";
    import fs from "fs";
    import { foo } from "xd";
  `);

      assert.strictEqual(warnings.length, 0);
      assert.deepEqual(
        [...extractDependencies(dependencySet).keys()].sort(),
        ["http", "fs", "xd"].sort()
      );
    });

    it("should append to list of probes (default)", () => {
      const analyser = new AstAnalyser({
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
      new AstAnalyser().analyse(source, { removeHTMLComments: true });

      const source2 = "const fs = require(\"fs\");";
      new AstAnalyser().analyse(source2, { removeHTMLComments: false });

      const calls = astAnalyserMock.mock.calls;
      assert.strictEqual(calls.length, 2);

      assert.deepEqual(calls[0].arguments, [source, { removeHTMLComments: true }]);
      assert.deepEqual(calls[1].arguments, [source2, { removeHTMLComments: false }]);
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
    it("should detect typescript extension and use TsSourceParser automatically", async() => {
      const result = await new AstAnalyser().analyseFile(
        new URL("test.ts", kFixtureURL),
        { packageName: "foobar" }
      );

      assert.ok(result.ok);
      assert.strictEqual(result.warnings.length, 0);
    });

    it("should throw when providing a typescript declaration file", async() => {
      await assert.rejects(() => new AstAnalyser().analyseFile(
        new URL("test.d.ts", kFixtureURL),
        { packageName: "foobar" }
      ), { message: "Declaration files are not supported" });
    });

    it("remove the packageName from the dependencies list", async() => {
      const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
      const result = await new AstAnalyser({ collectables: [dependencySet] }).analyseFile(
        new URL("depName.js", kFixtureURL),
        { packageName: "foobar" }
      );

      assert.ok(result.ok);
      assert.strictEqual(result.warnings.length, 0);
      assert.deepEqual([...extractDependencies(dependencySet).keys()],
        ["open"]
      );
    });

    it("should fail with a parsing error", async() => {
      const result = await getAnalyser().analyseFile(
        new URL("parsingError.js", kFixtureURL),
        { packageName: "foobar" }
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
        { packageName: "foobar" }
      );

      const url2 = new URL("parsingError.js", kFixtureURL);
      await new AstAnalyser().analyseFile(
        url2,
        { packageName: "foobar2" }
      );

      const calls = astAnalyserMock.mock.calls;
      assert.strictEqual(calls.length, 2);

      assert.deepEqual(calls[0].arguments, [url, { packageName: "foobar" }]);
      assert.deepEqual(calls[1].arguments, [url2, { packageName: "foobar2" }]);
    });

    it("should collect the full url and the ip address", async() => {
      const oneLineContent = "const IPv4URL = 'http://127.0.0.1:80/script'";
      const tmpdir = os.tmpdir();
      const tempOneLineFile = path.join(tmpdir, "temp-oneline.js");

      writeFileSync(tempOneLineFile, oneLineContent);

      const urlSet = new DefaultCollectableSet("url");
      const ipSet = new DefaultCollectableSet("ip");
      const hostnameSet = new DefaultCollectableSet("hostname");
      const collectables = [urlSet, ipSet, hostnameSet];

      try {
        await new AstAnalyser({
          collectables
        }).analyseFile(tempOneLineFile, {
          metadata: { spec: "react@19.0.1" }
        });
      }
      finally {
        unlinkSync(tempOneLineFile);
      }
      assert.deepEqual(Array.from(urlSet), [{
        value: "http://127.0.0.1/script",
        locations: [{ file: tmpdir, location: [[[1, 16], [1, 44]]], metadata: { spec: "react@19.0.1" } }]
      }]);
      assert.deepEqual(Array.from(hostnameSet), []);
      assert.deepEqual(Array.from(ipSet), [{
        value: "127.0.0.1",
        locations: [{ file: tmpdir, location: [[[1, 16], [1, 44]]], metadata: { spec: "react@19.0.1" } }]
      }]);
    });

    it("should implement new customProbes while keeping default probes", async() => {
      const result = await new AstAnalyser(
        {
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
          customProbes,
          skipDefaultProbes: true
        }
      ).analyseFile(new URL("customProbe.js", kFixtureURL));

      assert.equal(result.warnings[0].kind, kWarningUnsafeDanger);
      assert.equal(result.warnings.length, 1);
    });

    it("should call initialize and finalize of every probes at the end", async() => {
      const calls: string[] = [];
      await new AstAnalyser(
        {
          customProbes: [
            {
              name: "name",
              initialize: () => {
                calls.push("initialize");
              },
              validateNode: () => [true],
              main: () => null,
              finalize: () => calls.push("finalize")
            },
            {
              name: "classic probe",
              validateNode: () => [true],
              main: () => null
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

        it("should collect the full url and the ip address", () => {
          const urlSet = new DefaultCollectableSet("url");
          const ipSet = new DefaultCollectableSet("ip");
          const hostnameSet = new DefaultCollectableSet("hostname");
          const collectables = [urlSet, ipSet, hostnameSet];
          const str = "const IPv4URL = 'http://127.0.0.1:80/script'";
          new AstAnalyser({
            collectables
          }).analyse(str, { metadata: { spec: "react@19.0.1" } });

          assert.deepEqual(Array.from(urlSet), [{
            value: "http://127.0.0.1/script",
            locations: [{ file: null, location: [[[1, 16], [1, 44]]], metadata: { spec: "react@19.0.1" } }]
          }]);
          assert.deepEqual(Array.from(hostnameSet), []);
          assert.deepEqual(Array.from(ipSet), [{
            value: "127.0.0.1",
            locations: [{ file: null, location: [[[1, 16], [1, 44]]], metadata: { spec: "react@19.0.1" } }]
          }]);
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
    it("should detect typescript extension and use TsSourceParser automatically", () => {
      const result = new AstAnalyser().analyseFileSync(
        new URL("test.ts", kFixtureURL),
        { packageName: "foobar" }
      );

      assert.ok(result.ok);
      assert.strictEqual(result.warnings.length, 0);
    });

    it("should throw when providing a typescript declaration file", () => {
      assert.throws(() => new AstAnalyser().analyseFileSync(
        new URL("test.d.ts", kFixtureURL),
        { packageName: "foobar" }
      ), { message: "Declaration files are not supported" });
    });

    it("remove the packageName from the dependencies list", () => {
      const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
      const result = new AstAnalyser({ collectables: [dependencySet] }).analyseFileSync(
        new URL("depName.js", kFixtureURL),
        { packageName: "foobar" }
      );

      assert.ok(result.ok);
      assert.strictEqual(result.warnings.length, 0);
      assert.deepEqual([...extractDependencies(dependencySet).keys()],
        ["open"]
      );
    });

    it("should fail with a parsing error", () => {
      const result = getAnalyser().analyseFileSync(
        new URL("parsingError.js", kFixtureURL),
        { packageName: "foobar" }
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
        const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
        const result = new AstAnalyser({ collectables: [dependencySet] }).analyseFileSync(tempOneLineFile);

        t.assert.ok(result.ok);
        t.assert.ok(result.flags.has("oneline-require"));
        t.assert.strictEqual(result.flags.has("is-minified"), false);
        t.assert.deepEqual([...extractDependencies(dependencySet).keys()], ["foo"]);
      }
      finally {
        unlinkSync(tempOneLineFile);
      }
    });

    it("should collect infrastructure components", () => {
      const oneLineContent = "const IPv4URL = 'http://127.0.0.1:80/script'";
      const tmpdir = os.tmpdir();
      const tempOneLineFile = path.join(tmpdir, "temp-oneline.js");

      writeFileSync(tempOneLineFile, oneLineContent);

      const urlSet = new DefaultCollectableSet("url");
      const ipSet = new DefaultCollectableSet("ip");
      const hostnameSet = new DefaultCollectableSet("hostname");
      const collectables = [urlSet, ipSet, hostnameSet];

      try {
        new AstAnalyser({
          collectables
        }).analyseFileSync(tempOneLineFile, {
          metadata: { spec: "react@19.0.1" }
        });
      }
      finally {
        unlinkSync(tempOneLineFile);
      }
      assert.deepEqual(Array.from(urlSet), [{
        value: "http://127.0.0.1/script",
        locations: [{ file: tmpdir, location: [[[1, 16], [1, 44]]], metadata: { spec: "react@19.0.1" } }]
      }]);
      assert.deepEqual(Array.from(hostnameSet), []);
      assert.deepEqual(Array.from(ipSet), [{
        value: "127.0.0.1",
        locations: [{ file: tmpdir, location: [[[1, 16], [1, 44]]], metadata: { spec: "react@19.0.1" } }]
      }]);
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
        const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
        const analyser = new AstAnalyser({ collectables: [dependencySet] });
        // perform basic operations
        analyser.analyse("const foo = 'bar';");
        // compare array of keys to an empty array to ensure there are no dependencies in result
        assert.deepEqual([...extractDependencies(dependencySet).keys()], []);
      });
    });

    it("should instantiate with correct default options", () => {
      const analyser = new AstAnalyser();
      assert.deepStrictEqual(analyser.probes, ProbeRunner.Defaults);
    });

    it("should properly instanciate default or custom parser (using analyseFile)", async(t) => {
      const jsSourceParserMock = t.mock.method(JsSourceParser.prototype, "parse");
      const fakeSourceParserMock = t.mock.method(FakeSourceParser.prototype, "parse");

      await new AstAnalyser().analyseFile(
        new URL("depName.js", kFixtureURL),
        { packageName: "foobar" }
      );

      await new AstAnalyser().analyseFile(
        new URL("parsingError.js", kFixtureURL),
        {
          packageName: "foobar2",
          customParser: new FakeSourceParser()
        }
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

      new AstAnalyser().analyse("const http = require(\"http\");", { removeHTMLComments: true });

      new AstAnalyser().analyse("const fs = require(\"fs\");",
        {
          removeHTMLComments: false,
          customParser: new FakeSourceParser()
        }
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
function getAnalyser(): {
  analyse: AstAnalyser["analyse"];
  analyseFile: AstAnalyser["analyseFile"];
  analyseFileSync: AstAnalyser["analyseFileSync"];
  prepareSource: AstAnalyser["prepareSource"];
} {
  const dependencySet = new DefaultCollectableSet("dependency");
  if (!analyser) {
    analyser = new AstAnalyser({ collectables: [dependencySet] });
  }

  return analyser;
}
