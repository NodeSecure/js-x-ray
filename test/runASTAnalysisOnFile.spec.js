// Import Node.js Dependencies
import { it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysisOnFile } from "../index.js";
import { AstAnalyser } from "../src/AstAnalyser.js";
import { FakeSourceParser } from "./fixtures/FakeSourceParser.js";
import { JsSourceParser } from "../src/JsSourceParser.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

it("should call AstAnalyser.analyseFile with the expected arguments", async(t) => {
  t.mock.method(AstAnalyser.prototype, "analyseFile");

  const url = new URL("depName.js", FIXTURE_URL);
  await runASTAnalysisOnFile(
    url,
    { module: false, packageName: "foobar" }
  );

  const url2 = new URL("parsingError.js", FIXTURE_URL);
  await runASTAnalysisOnFile(
    url,
    { module: true, packageName: "foobar2" }
  );

  const calls = AstAnalyser.prototype.analyseFile.mock.calls;
  assert.strictEqual(calls.length, 2);

  assert.deepEqual(calls[0].arguments, [url, { module: false, packageName: "foobar" }]);
  assert.deepEqual(calls[1].arguments, [url2, { module: true, packageName: "foobar2" }]);
});

it("should instantiate AstAnalyser with the expected parser", async(t) => {
  t.mock.method(JsSourceParser.prototype, "parse");
  t.mock.method(FakeSourceParser.prototype, "parse");

  await runASTAnalysisOnFile(
    new URL("depName.js", FIXTURE_URL),
    { module: false, packageName: "foobar" }
  );

  await runASTAnalysisOnFile(
    new URL("parsingError.js", FIXTURE_URL),
    { module: true, packageName: "foobar2", customParser: new FakeSourceParser() }
  );

  assert.strictEqual(JsSourceParser.prototype.parse.mock.calls.length, 1);
  assert.strictEqual(FakeSourceParser.prototype.parse.mock.calls.length, 1);
});
