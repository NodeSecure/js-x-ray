// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { EntryFilesAnalyser } from "../src/EntryFilesAnalyser.js";
import { AstAnalyser } from "../src/AstAnalyser.js";

const FIXTURE_URL = new URL("fixtures/entryFiles/", import.meta.url);

describe("EntryFilesAnalyser", () => {
  it("should analyze internal dependencies recursively", async(t) => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("entry.js", FIXTURE_URL);
    const deepEntryUrl = new URL("deps/deepEntry.js", FIXTURE_URL);
    const entryFiles = [entryUrl, deepEntryUrl];

    t.mock.method(AstAnalyser.prototype, "analyseFile");
    const generator = entryFilesAnalyser.analyse(entryFiles);

    await assertReport(generator, entryUrl, true);
    await assertReport(generator, new URL("deps/dep1.js", FIXTURE_URL), true);
    await assertReport(generator, new URL("shared.js", FIXTURE_URL), true);
    await assertReport(generator, new URL("deps/dep2.js", FIXTURE_URL), true);
    await assertReport(generator, deepEntryUrl, true);
    await assertReport(generator, new URL("deps/dep3.js", FIXTURE_URL), true);

    // Check that shared dependencies are not analyzed several times
    const calls = AstAnalyser.prototype.analyseFile.mock.calls;
    assert.strictEqual(calls.length, 6);
  });

  it("should detect internal deps that failed to be analyzed", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser();
    const entryUrl = new URL("entryWithInvalidDep.js", FIXTURE_URL);
    const entryFiles = [entryUrl];

    const generator = entryFilesAnalyser.analyse(entryFiles);

    await assertReport(generator, entryUrl, true);

    const invalidDepReport = await generator.next();
    assert.ok(!invalidDepReport.value.ok);
    assert.strictEqual(invalidDepReport.value.url, new URL("deps/invalidDep.js", FIXTURE_URL).pathname);
    assert.strictEqual(invalidDepReport.value.warnings[0].kind, "parsing-error");

    await assertReport(generator, new URL("deps/dep1.js", FIXTURE_URL), true);
  });

  it("should extends default extensions", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      loadExtensions: (exts) => [...exts, "jsx"]
    });
    const entryUrl = new URL("entryWithVariousDepExtensions.js", FIXTURE_URL);
    const generator = entryFilesAnalyser.analyse([entryUrl]);

    await assertReport(generator, entryUrl, true);
    await assertReport(generator, new URL("deps/default.js", FIXTURE_URL), true);
    await assertReport(generator, new URL("deps/default.cjs", FIXTURE_URL), true);
    await assertReport(generator, new URL("deps/default.mjs", FIXTURE_URL), true);
    await assertReport(generator, new URL("deps/default.node", FIXTURE_URL), true);
    await assertReport(generator, new URL("deps/default.jsx", FIXTURE_URL), true);

    assert.strictEqual((await generator.next()).value, undefined);
  });

  it("should override default extensions", async() => {
    const entryFilesAnalyser = new EntryFilesAnalyser({
      loadExtensions: () => ["jsx"]
    });
    const entryUrl = new URL("entryWithVariousDepExtensions.js", FIXTURE_URL);
    const generator = entryFilesAnalyser.analyse([entryUrl]);

    await assertReport(generator, entryUrl, true);
    await assertReport(generator, new URL("deps/default.jsx", FIXTURE_URL), true);

    assert.strictEqual((await generator.next()).value, undefined);
  });

  async function assertReport(generator, expectedUrl, expectedOk) {
    const report = await generator.next();
    assert.strictEqual(report.value.url, expectedUrl.pathname);
    assert.strictEqual(report.value.ok, expectedOk);
  }
});
