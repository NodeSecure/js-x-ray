// Import Node.js Dependencies
import assert from "node:assert";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

// Import Internal Dependencies
import { AstAnalyser, DefaultCollectableSet, EntryFilesAnalyser } from "../src/index.ts";

// CONSTANTS
const kFixtureURL = new URL("fixtures/entryFiles/", import.meta.url);
const kFixtureURLPath = fileURLToPath(kFixtureURL);

const kFixtureTypeScriptURL = new URL("fixtures/entryFilesTs/", import.meta.url);

describe("EntryFilesAnalyser", () => {
  it("should throw when astAnalyzer has no 'dependency' collectable", () => {
    const astAnalyzer = new AstAnalyser();

    assert.throws(
      () => new EntryFilesAnalyser({ astAnalyzer }),
      {
        message: "astAnalyzer instance must have a 'dependency' collectable"
      }
    );
  });

  it("should analyze internal dependencies recursively", async(t) => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("entry.js", kFixtureURL);
    const deepEntryUrl = new URL("deps/deepEntry.js", kFixtureURL);

    const analyseFileMock = t.mock.method(AstAnalyser.prototype, "analyseFile");

    const generator = entryFilesAnalyser.analyse([
      entryUrl,
      deepEntryUrl
    ]);
    const reports = await Array.fromAsync(generator);

    // Order is non-deterministic due to concurrent processing; check the set of files
    assert.deepEqual(
      reports.map((report) => report.file).sort(),
      [
        entryUrl,
        new URL("deps/dep1.js", kFixtureURL),
        new URL("shared.js", kFixtureURL),
        new URL("deps/dep2.js", kFixtureURL),
        deepEntryUrl,
        new URL("deps/dep3.js", kFixtureURL)
      ].map((url) => fileURLToPath(url)).sort()
    );

    // Check that shared dependencies are not analyzed several times
    const calls = analyseFileMock.mock.calls;
    assert.strictEqual(calls.length, 6);
  });

  it("should analyze ESM export statements recursively", async(t) => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("export.js", kFixtureURL);

    const analyseFileMock = t.mock.method(AstAnalyser.prototype, "analyseFile");

    const generator = entryFilesAnalyser.analyse([
      entryUrl
    ]);
    const reports = await Array.fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("shared.js", kFixtureURL)
      ].map((url) => fileURLToPath(url))
    );

    // Check that shared dependencies are not analyzed several times
    const calls = analyseFileMock.mock.calls;
    assert.strictEqual(calls.length, 2);
  });

  it("should detect internal deps that failed to be analyzed", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("entryWithInvalidDep.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse([entryUrl]);
    const reports = await Array.fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("deps/invalidDep.js", kFixtureURL),
        new URL("deps/dep1.js", kFixtureURL),
        new URL("shared.js", kFixtureURL)
      ].map((url) => fileURLToPath(url))
    );

    const invalidReports = reports.filter((report) => !report.ok);
    assert.strictEqual(invalidReports.length, 1);
    assert.strictEqual(
      invalidReports[0].warnings[0].kind,
      "parsing-error"
    );
  });

  it("should extends default extensions", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      loadExtensions: (exts) => [...exts, "jsx"]
    });

    const entryUrl = new URL("entryWithVariousDepExtensions.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse([entryUrl]);
    const reports = await Array.fromAsync(generator);

    // Order is non-deterministic due to concurrent processing; check the set of files
    assert.deepEqual(
      reports.map((report) => report.file).sort(),
      [
        entryUrl,
        new URL("deps/default.js", kFixtureURL),
        new URL("deps/default.cjs", kFixtureURL),
        new URL("deps/dep.cjs", kFixtureURL),
        new URL("deps/default.mjs", kFixtureURL),
        new URL("deps/dep.mjs", kFixtureURL),
        new URL("deps/default.node", kFixtureURL),
        new URL("deps/dep.node", kFixtureURL),
        new URL("deps/default.jsx", kFixtureURL),
        new URL("deps/dep.jsx", kFixtureURL)
      ].map((url) => fileURLToPath(url)).sort()
    );
  });

  it("should override default extensions", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      loadExtensions: () => ["jsx"]
    });
    const entryUrl = new URL("entryWithVariousDepExtensions.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse([entryUrl]);
    const reports = await Array.fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("deps/default.jsx", kFixtureURL),
        new URL("deps/dep.jsx", kFixtureURL)
      ].map((url) => fileURLToPath(url))
    );
  });

  it("should detect recursive dependencies using DiGraph (with rootPath)", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      rootPath: kFixtureURL
    });
    const entryUrl = new URL("recursive/A.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse(
      [entryUrl]
    );
    await Array.fromAsync(generator);

    assert.deepEqual(
      [...entryFilesAnalyser.dependencies.findCycles()],
      [
        ["recursive/A.js", "recursive/B.js"].map((str) => path.normalize(str))
      ]
    );

    assert.deepEqual(
      [
        ...entryFilesAnalyser.dependencies.getDeepChildren(
          path.normalize("recursive/A.js"), 1
        )
      ],
      [
        path.normalize("recursive/B.js")
      ]
    );
  });

  it("should detect recursive dependencies using DiGraph but without rootPath everything is absolute", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("recursive/A.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse(
      [entryUrl]
    );
    await Array.fromAsync(generator);

    for (const [from, to] of [...entryFilesAnalyser.dependencies.findCycles()]) {
      assert.ok(path.isAbsolute(from));
      assert.ok(path.isAbsolute(to));
      assert.ok(from.startsWith(kFixtureURLPath));
      assert.ok(to.startsWith(kFixtureURLPath));
    }
  });

  it("should automatically build absolute path for entryFiles when rootPath is provided", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      rootPath: kFixtureURL
    });

    const generator = entryFilesAnalyser.analyse(
      ["recursive/A.js"]
    );
    const reports = await Array.fromAsync(generator);

    const files = reports.map((report) => path.normalize(report.file));
    assert.deepEqual(
      files,
      [
        "recursive/A.js",
        "recursive/B.js"
      ].map((file) => path.normalize(file))
    );
  });

  it("should ignore file that does not exist when option ignoreENOENT is provided", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      ignoreENOENT: true,
      rootPath: kFixtureURL
    });

    const entryUrl = new URL("does-not-exists.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse(
      [entryUrl]
    );

    const reports = await Array.fromAsync(generator);
    assert.strictEqual(reports.length, 0);
    assert.strictEqual(entryFilesAnalyser.dependencies.hasVertex("does-not-exists.js"), false);
  });

  it("should parse, analyze and follow dependencies in TypeScript", async(t) => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("entry.ts", kFixtureTypeScriptURL);

    const analyseFileMock = t.mock.method(AstAnalyser.prototype, "analyseFile");

    const generator = entryFilesAnalyser.analyse([
      entryUrl
    ]);
    const reports = await Array.fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("entryExport.ts", kFixtureTypeScriptURL)
      ].map((url) => fileURLToPath(url))
    );

    // Check that shared dependencies are not analyzed several times
    const calls = analyseFileMock.mock.calls;
    assert.strictEqual(calls.length, 2);
  });

  it("should pass fileMetadata per file to the dependency collectable", async() => {
    const depSet = new DefaultCollectableSet("dependency");
    const astAnalyzer = new AstAnalyser({
      collectables: [depSet]
    });

    const entryFilesAnalyser = new EntryFilesAnalyser({
      rootPath: kFixtureURL,
      astAnalyzer
    });
    const entryUrl = new URL("entry.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse(
      [entryUrl],
      {
        fileMetadata: (file) => {
          return { customFile: path.basename(file) };
        }
      }
    );
    await Array.fromAsync(generator);

    for (const { locations } of depSet) {
      for (const loc of locations) {
        assert.ok(loc.metadata);
        assert.ok("customFile" in loc.metadata);
      }
    }
  });

  it("should merge fileMetadata with global metadata in collectables", async() => {
    const depSet = new DefaultCollectableSet("dependency");
    const astAnalyzer = new AstAnalyser({
      collectables: [depSet]
    });

    const entryFilesAnalyser = new EntryFilesAnalyser({
      rootPath: kFixtureURL,
      astAnalyzer
    });
    const entryUrl = new URL("entry.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse(
      [entryUrl],
      {
        metadata: { project: "test-project" },
        fileMetadata: (file) => {
          return { customFile: path.basename(file) };
        }
      }
    );
    await Array.fromAsync(generator);

    for (const { locations } of depSet) {
      for (const loc of locations) {
        assert.ok(loc.metadata);
        assert.strictEqual(loc.metadata.project, "test-project");
        assert.ok("customFile" in loc.metadata);
      }
    }
  });

  it("should allow fileMetadata to override global metadata in collectables", async() => {
    const depSet = new DefaultCollectableSet("dependency");
    const astAnalyzer = new AstAnalyser({
      collectables: [depSet]
    });

    const entryFilesAnalyser = new EntryFilesAnalyser({
      rootPath: kFixtureURL,
      astAnalyzer
    });
    const entryUrl = new URL("entry.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse(
      [entryUrl],
      {
        metadata: { origin: "global" },
        fileMetadata: () => {
          return { origin: "per-file" };
        }
      }
    );
    await Array.fromAsync(generator);

    for (const { locations } of depSet) {
      for (const loc of locations) {
        assert.ok(loc.metadata);
        assert.strictEqual(loc.metadata.origin, "per-file");
      }
    }
  });

  it("should not mutate global metadata when using fileMetadata", async() => {
    const astAnalyzer = new AstAnalyser({
      collectables: [
        new DefaultCollectableSet("dependency")
      ]
    });

    const entryFilesAnalyser = new EntryFilesAnalyser({
      rootPath: kFixtureURL,
      astAnalyzer
    });
    const entryUrl = new URL("entry.js", kFixtureURL);

    const globalMetadata = { project: "test-project" };

    const generator = entryFilesAnalyser.analyse(
      [entryUrl],
      {
        metadata: globalMetadata,
        fileMetadata: () => {
          return { extra: "value" };
        }
      }
    );
    await Array.fromAsync(generator);

    assert.deepStrictEqual(globalMetadata, { project: "test-project" });
    assert.strictEqual("extra" in globalMetadata, false);
  });

  it("should not crash when a parsing error occurs", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      ignoreENOENT: true,
      rootPath: kFixtureURL
    });

    const entryUrl = new URL("parsing-error.js", kFixtureURL);
    await assert.doesNotReject(async() => {
      const generator = entryFilesAnalyser.analyse(
        [entryUrl]
      );
      await Array.fromAsync(generator);
    });
  });

  describe("stats", () => {
    it("should return the number of files analyzed and total dependencies", async() => {
      const entryFilesAnalyser = new EntryFilesAnalyser();
      const entryUrl = new URL("entry.js", kFixtureURL);
      const deepEntryUrl = new URL("deps/deepEntry.js", kFixtureURL);

      const generator = entryFilesAnalyser.analyse([
        entryUrl,
        deepEntryUrl
      ]);
      await Array.fromAsync(generator);

      assert.strictEqual(entryFilesAnalyser.stats.filesAnalyzed, 6);
      assert.strictEqual(entryFilesAnalyser.stats.totalDependencies, 8);
    });

    it("should return stats for a single entry file with ESM exports", async() => {
      const entryFilesAnalyser = new EntryFilesAnalyser();
      const entryUrl = new URL("export.js", kFixtureURL);

      const generator = entryFilesAnalyser.analyse([entryUrl]);
      await Array.fromAsync(generator);

      assert.strictEqual(entryFilesAnalyser.stats.filesAnalyzed, 2);
      assert.strictEqual(entryFilesAnalyser.stats.totalDependencies, 2);
    });

    it("should return stats for recursive dependencies", async() => {
      const entryFilesAnalyser = new EntryFilesAnalyser({
        rootPath: kFixtureURL
      });
      const entryUrl = new URL("recursive/A.js", kFixtureURL);

      const generator = entryFilesAnalyser.analyse([entryUrl]);
      await Array.fromAsync(generator);

      assert.strictEqual(entryFilesAnalyser.stats.filesAnalyzed, 2);
      assert.strictEqual(entryFilesAnalyser.stats.totalDependencies, 2);
    });

    it("should return zero stats when no files are analyzed", async() => {
      const entryFilesAnalyser = new EntryFilesAnalyser({
        ignoreENOENT: true,
        rootPath: kFixtureURL
      });

      const entryUrl = new URL("does-not-exists.js", kFixtureURL);

      const generator = entryFilesAnalyser.analyse([entryUrl]);
      await Array.fromAsync(generator);

      assert.strictEqual(entryFilesAnalyser.stats.filesAnalyzed, 0);
      assert.strictEqual(entryFilesAnalyser.stats.totalDependencies, 0);
    });

    it("should reset stats on each analyse call", async() => {
      const entryFilesAnalyser = new EntryFilesAnalyser();

      // First analysis with multiple entry files
      const entryUrl = new URL("entry.js", kFixtureURL);
      const deepEntryUrl = new URL("deps/deepEntry.js", kFixtureURL);
      const generator1 = entryFilesAnalyser.analyse([entryUrl, deepEntryUrl]);
      await Array.fromAsync(generator1);

      assert.strictEqual(entryFilesAnalyser.stats.filesAnalyzed, 6);
      assert.strictEqual(entryFilesAnalyser.stats.totalDependencies, 8);

      // Verify stats are correct with a fresh instance
      const efa2 = new EntryFilesAnalyser();
      const exportUrl = new URL("export.js", kFixtureURL);
      const generator2 = efa2.analyse([exportUrl]);
      await Array.fromAsync(generator2);

      assert.strictEqual(efa2.stats.filesAnalyzed, 2);
      assert.strictEqual(efa2.stats.totalDependencies, 2);
    });
  });
});
