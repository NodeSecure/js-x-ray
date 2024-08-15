// Import Node.js Dependencies
import { it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import {
  AstAnalyser,
  JsSourceParser
} from "../index.js";
import { FakeSourceParser } from "./fixtures/FakeSourceParser.js";
import {
  customProbes,
  kWarningUnsafeDanger,
  kWarningUnsafeImport,
  kWarningUnsafeStmt
} from "./utils/index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

it("should call AstAnalyser.analyseFile with the expected arguments", async(t) => {
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

it("should instantiate AstAnalyser with the expected parser", async(t) => {
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

it("should append list of probes using runASTAnalysisOnFile", async() => {
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

it("should replace list of probes using runASTAnalysisOnFile", async() => {
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
