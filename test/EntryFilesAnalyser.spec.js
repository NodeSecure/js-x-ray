// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Internal Dependencies
import { EntryFilesAnalyser, AstAnalyser } from "../index.js";

const FIXTURE_URL = new URL("fixtures/entryFiles/", import.meta.url);
const FIXTURE_URL_PATH = fileURLToPath(FIXTURE_URL);

describe("EntryFilesAnalyser", () => {
  it("should analyze internal dependencies recursively", async(t) => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("entry.js", FIXTURE_URL);
    const deepEntryUrl = new URL("deps/deepEntry.js", FIXTURE_URL);

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
        new URL("deps/dep1.js", FIXTURE_URL),
        new URL("shared.js", FIXTURE_URL),
        new URL("deps/dep2.js", FIXTURE_URL),
        deepEntryUrl,
        new URL("deps/dep3.js", FIXTURE_URL)
      ].map((url) => fileURLToPath(url))
    );

    // Check that shared dependencies are not analyzed several times
    const calls = AstAnalyser.prototype.analyseFile.mock.calls;
    assert.strictEqual(calls.length, 6);
  });

  it("should analyze ESM export statements recursively", async(t) => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("export.js", FIXTURE_URL);

    t.mock.method(AstAnalyser.prototype, "analyseFile");

    const generator = entryFilesAnalyser.analyse([
      entryUrl
    ]);
    const reports = await fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("shared.js", FIXTURE_URL)
      ].map((url) => fileURLToPath(url))
    );

    // Check that shared dependencies are not analyzed several times
    const calls = AstAnalyser.prototype.analyseFile.mock.calls;
    assert.strictEqual(calls.length, 2);
  });

  it("should detect internal deps that failed to be analyzed", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("entryWithInvalidDep.js", FIXTURE_URL);

    const generator = entryFilesAnalyser.analyse([entryUrl]);
    const reports = await fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("deps/invalidDep.js", FIXTURE_URL),
        new URL("deps/dep1.js", FIXTURE_URL),
        new URL("shared.js", FIXTURE_URL)
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
    const entryUrl = new URL("entryWithVariousDepExtensions.js", FIXTURE_URL);

    const generator = entryFilesAnalyser.analyse([entryUrl]);
    const reports = await fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("deps/default.js", FIXTURE_URL),
        new URL("deps/default.cjs", FIXTURE_URL),
        new URL("deps/dep.cjs", FIXTURE_URL),
        new URL("deps/default.mjs", FIXTURE_URL),
        new URL("deps/dep.mjs", FIXTURE_URL),
        new URL("deps/default.node", FIXTURE_URL),
        new URL("deps/dep.node", FIXTURE_URL),
        new URL("deps/default.jsx", FIXTURE_URL),
        new URL("deps/dep.jsx", FIXTURE_URL)
      ].map((url) => fileURLToPath(url))
    );
  });

  it("should override default extensions", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      loadExtensions: () => ["jsx"]
    });
    const entryUrl = new URL("entryWithVariousDepExtensions.js", FIXTURE_URL);

    const generator = entryFilesAnalyser.analyse([entryUrl]);
    const reports = await fromAsync(generator);

    assert.deepEqual(
      reports.map((report) => report.file),
      [
        entryUrl,
        new URL("deps/default.jsx", FIXTURE_URL),
        new URL("deps/dep.jsx", FIXTURE_URL)
      ].map((url) => fileURLToPath(url))
    );
  });

  it("should detect recursive dependencies using DiGraph (with rootPath)", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      rootPath: FIXTURE_URL
    });
    const entryUrl = new URL("recursive/A.js", FIXTURE_URL);

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
    const entryUrl = new URL("recursive/A.js", FIXTURE_URL);

    const generator = entryFilesAnalyser.analyse(
      [entryUrl]
    );
    await fromAsync(generator);

    for (const [from, to] of [...entryFilesAnalyser.dependencies.findCycles()]) {
      assert.ok(path.isAbsolute(from));
      assert.ok(path.isAbsolute(to));
      assert.ok(from.startsWith(FIXTURE_URL_PATH));
      assert.ok(to.startsWith(FIXTURE_URL_PATH));
    }
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
