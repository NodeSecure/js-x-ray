// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Internal Dependencies
import { EntryFilesAnalyser, AstAnalyser } from "../src/index.js";

const kFixtureURL = new URL("fixtures/entryFiles/", import.meta.url);
const kFixtureURLPath = fileURLToPath(kFixtureURL);

describe("EntryFilesAnalyser", () => {
  it("should analyze internal dependencies recursively", async(t) => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("entry.js", kFixtureURL);
    const deepEntryUrl = new URL("deps/deepEntry.js", kFixtureURL);

    t.mock.method(AstAnalyser.prototype, "analyseFile");

    const generator = entryFilesAnalyser.analyse([
      entryUrl,
      deepEntryUrl
    ]);
    const reports = await fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("deps/dep1.js", kFixtureURL),
        new URL("shared.js", kFixtureURL),
        new URL("deps/dep2.js", kFixtureURL),
        deepEntryUrl,
        new URL("deps/dep3.js", kFixtureURL)
      ].map((url) => fileURLToPath(url))
    );

    // Check that shared dependencies are not analyzed several times
    const calls = AstAnalyser.prototype.analyseFile.mock.calls;
    assert.strictEqual(calls.length, 6);
  });

  it("should analyze ESM export statements recursively", async(t) => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("export.js", kFixtureURL);

    t.mock.method(AstAnalyser.prototype, "analyseFile");

    const generator = entryFilesAnalyser.analyse([
      entryUrl
    ]);
    const reports = await fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("shared.js", kFixtureURL)
      ].map((url) => fileURLToPath(url))
    );

    // Check that shared dependencies are not analyzed several times
    const calls = AstAnalyser.prototype.analyseFile.mock.calls;
    assert.strictEqual(calls.length, 2);
  });

  it("should detect internal deps that failed to be analyzed", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("entryWithInvalidDep.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse([entryUrl]);
    const reports = await fromAsync(generator);

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
    const reports = await fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
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
      ].map((url) => fileURLToPath(url))
    );
  });

  it("should override default extensions", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      loadExtensions: () => ["jsx"]
    });
    const entryUrl = new URL("entryWithVariousDepExtensions.js", kFixtureURL);

    const generator = entryFilesAnalyser.analyse([entryUrl]);
    const reports = await fromAsync(generator);

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
    await fromAsync(generator);

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
    await fromAsync(generator);

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
    const reports = await fromAsync(generator);

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

    const reports = await fromAsync(generator);
    assert.strictEqual(reports.length, 0);
    assert.strictEqual(entryFilesAnalyser.dependencies.hasVertex("does-not-exists.js"), false);
  });
});

// TODO: replace with Array.fromAsync when droping Node.js 20
async function fromAsync(asyncIter) {
  const items = [];

  for await (const item of asyncIter) {
    items.push(item);
  }

  return items;
}
